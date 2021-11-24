const parseStringSync = require('xml2js-parser').parseStringSync;
const axios = require("axios");

const getWimsData = async (datesObject, fuelModel, obType, user, station,dataType) => {
  const returnObj = {}
  const nfdrsUrl = `https://famprod.nwcg.gov/wims/xsql/${dataType}.xsql?stn=${station}&sig=&type=${obType}&start=${datesObject.day1}&end=${datesObject.day7}&time=&user=${user}&fmodel=${fuelModel}`
  console.log('ur', nfdrsUrl)
  const wimsNfdrsRequest = await axios.get(nfdrsUrl)
  const hasData = wimsNfdrsRequest && wimsNfdrsRequest.data && wimsNfdrsRequest.data.match('row') ? true : false
  if(hasData){
    returnObj['data'] = await parseStringSync(wimsNfdrsRequest.data)[dataType]['row']
  }
  else{
    returnObj['error'] = 'no data'
  }
  return returnObj
}

module.exports = getWimsData

