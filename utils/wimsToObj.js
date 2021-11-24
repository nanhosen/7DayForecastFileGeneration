const wimsToObj = (data, type, stnConfig) => {
  // console.log('data', data)
  const wimsObj = {}
  const varKey = type == 'nfdrs' ? 'nfdrsVars' : 'wxVars'
  const dateNm = type == 'nfdrs' ? 'nfdr_dt' : 'fcst_dt'
  console.log('data length', data.length)
  console.log('yp length', data.length)

  data.map(curr => {
    const obObj = {}
    // console.log('curr', curr)
    stnConfig[varKey].map(currVar => {
      if(!curr[currVar]){
        console.log("I am missing data for here", 'varKey', varKey, 'currVar', currVar, 'curr', curr)
      }
      obObj[currVar] = curr[currVar] ? curr[currVar][0] : null  //wims data comes back as a weird array. takes the single value out of the array and makes an object of all the elements for the date
    })
    const currId = curr.sta_id[0]
    const currDate = curr[dateNm][0]
    const objKeys = Object.keys(wimsObj)
    if (objKeys.indexOf(currId) < 0) {
      wimsObj[currId] = {}
      wimsObj[currId]['sta_nm'] = curr.sta_nm[0]
      wimsObj[currId]['latitude'] = curr.latitude[0]
      wimsObj[currId]['longitude'] = curr.longitude[0]
      wimsObj[currId][currDate] = obObj
    }
    else {
      const currDates = Object.keys(wimsObj[currId])
      if (currDates.indexOf(currDate) < 1) {
        wimsObj[currId][currDate] = obObj
      }
    }
  })
  return wimsObj
}

module.exports = wimsToObj