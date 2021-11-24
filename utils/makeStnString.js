const makeStnString = (stnId, wxObj, nfdrsObj, stnConfig, dateArray) => {
  const combinedNfdrsWxObj = {wxObj, nfdrsObj}
  const headerMonth = new Date(dateArray[2]).getMonth() + 1 < 10 ? `0${new Date(dateArray[2]).getMonth() + 1}` : new Date(dateArray[2]).getMonth() + 1 //have to add a leading zero to the month
  const headerDay = new Date(dateArray[2]).getDate() < 10 ? `0${new Date(dateArray[2]).getDate()}` : new Date(dateArray[2]).getDate()
  const timeStamp = `${new Date(dateArray[2]).getFullYear()}${headerMonth}${headerDay}`
  const lat = parseFloat(wxObj['latitude'])
  const lon = parseFloat(wxObj['longitude'])
  const properSpacesName = addEnoughSpaces(`*${wxObj['sta_nm']}`, 20) //match spacing requirements for ingest
  const properSpacesId = addEnoughSpaces(`${stnId}`, 8)
  const properSpacesLat = addEnoughSpaces(lat, 8)
  const properSpacesLon = addEnoughSpaces(lon, 9)
  var stnString = `\n\n${properSpacesName}${properSpacesId}${properSpacesLat} ${properSpacesLon}${timeStamp}  21   \nFcst Dy             `
  const stnObj = {}
  dateArray.map(currDate => { //make first line of dates in txt file
    const isoDate = new Date(currDate).toISOString()
    const inFormat = isoDate.slice(5, 10).replace('-', '/')
    stnString += addEnoughSpaces(inFormat, 9)
  })

  for (var element in stnConfig.longNames) { //loop over each element and then each day in the element. have to do element and then date to get the values in rows
    dateArray.map((currDate, i) => {
      if (i == 0) {
        const elementLabel = addEnoughSpaces(stnConfig['longNames'][element], 23)
        stnString += '\n' + elementLabel
      }
      const objLocation = findIndiceSource(element, stnConfig)
      const currMonth = new Date(currDate).getMonth() + 1 < 10 ? `0${new Date(currDate).getMonth() + 1}` : new Date(currDate).getMonth() + 1
      const currDay = new Date(currDate).getDate() < 10 ? `0${new Date(currDate).getDate()}` : new Date(currDate).getDate()
      const currDateFormatted = `${currMonth}/${currDay}/${new Date(currDate).getFullYear()}`
     

      const val = combinedNfdrsWxObj[objLocation][currDateFormatted] && combinedNfdrsWxObj[objLocation][currDateFormatted][element] ? parseFloat(combinedNfdrsWxObj[objLocation][currDateFormatted][element]).toFixed(0).toString() : stnConfig.noData
      if(!stnObj[currDateFormatted]){
        stnObj[currDateFormatted]={[element]:val}
      }
      else{
        stnObj[currDateFormatted][element]=val
      }
      stnString += addEnoughSpaces(val, 9)
      if (i == dateArray.length) {
        stnString += '\n\n'
      }
    })
  }
  
  // console.log('stnString', stnString)
  return {stnString, stnObj}
}

module.exports = makeStnString


const addEnoughSpaces = (string, length) => {
  var emptyAr = []
  var i = 0
  while (i < length) {
    emptyAr.push(' ')
    i++
  }
  const emptyString = emptyAr.join('')
  const addThis = emptyString.substr(string.length)
  const fullName = `${string + addThis}`
  return fullName
}

const findIndiceSource = (element, stnConfig) => {
  if (stnConfig.wxVars.indexOf(element) >=0){
    return 'wxObj'
  }
  else if(stnConfig.nfdrsVars.indexOf(element) >= 0) {
    return 'nfdrsObj'
  }
  else {
    return null
  }
}

// wxObj {
//   '20107': {
//     sta_nm: 'LOGAN',
//       latitude: '  36.3531',
//         longitude: '-113.1992',
//           '06/30/2021': {
//       rh_max: '43',
//         temp_min: '64',
//           rh_min: '17',
//             temp_max: '84',
//               wind_sp: '11'
//     },
//     '06/29/2021': {
//       rh_max: '37',
//         temp_min: '65',
//           rh_min: '15',
//             temp_max: '84',
//               wind_sp: '10'
//     },
//     '06/28/2021': {
//       rh_max: '34',
//         temp_min: '64',
//           rh_min: '14',
//             temp_max: '83',
//               wind_sp: '10'
//     },
//     '06/27/2021': {
//       rh_max: '38',
//         temp_min: '62',
//           rh_min: '15',
//             temp_max: '82',
//               wind_sp: '11'
//     },
//     '06/26/2021': {
//       rh_max: '32',
//         temp_min: '60',
//           rh_min: '14',
//             temp_max: '78',
//               wind_sp: '11'
//     },
//     '06/25/2021': {
//       rh_max: '53',
//         temp_min: '58',
//           rh_min: '16',
//             temp_max: '76',
//               wind_sp: '10'
//     },
//     '06/24/2021': {
//       rh_max: '64',
//         temp_min: '57',
//           rh_min: '31',
//             temp_max: '71',
//               wind_sp: '11'
//     },
//     '06/23/2021': {
//       rh_max: '40',
//         temp_min: '64',
//           rh_min: '14',
//             temp_max: '81',
//               wind_sp: '11'
//     }
//   }
// }
