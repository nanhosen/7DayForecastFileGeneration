const parseStringSync = require('xml2js-parser').parseStringSync;
const axios = require("axios");


const getWimsData = async (datesObject, fuelModel, obType, user, station,dataType) => {
  const returnObj = {}
  const nfdrsUrl = 'https://famprod.nwcg.gov/wims/xsql/nfdrs.xsql?stn=&sig=EACC&type=O&start=2-APR-19&end=2-APR-19&time=&user=smarien&fmodel=7G'
  const wimsNfdrsRequest = await axios.getnfdrsUr(l)
  // console.log('wimsNfdrsRequest', wimsNfdrsRequest)
  const hasData = wimsNfdrsRequest && wimsNfdrsRequest.data && wimsNfdrsRequest.data.match('row') ? true : false
  const stnArray = []
  if(hasData){
    const dataObj = await parseStringSync(wimsNfdrsRequest.data)['nfdrs']['row']
    for(var obj in dataObj){
    	const dataObjIndiv = dataObj[obj]
    	stnArray.push(parseFloa(dtataObjIndiv['sta_id'][0]))
    	// console.log('obj', dataObjIndiv['sta_id'][0])
    }
  }
  else{
    returnObj['error'] = 'no data'
  }
  console.log(JSON.stringify(stnArray))
  return returnObj
}

module.exports = getWimsData
// getWimsData()