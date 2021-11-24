const axios = require("axios");
const async = require("async")
const parseStringSync = require('xml2js-parser').parseStringSync;
const fs = require('fs')
require('dotenv').config()

const requestAndProcessWimsData = async(sig) => {
  try{
    // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    // Set the region
    AWS.config.update({region: 'us-east-2'});

    // Create S3 service object
    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY
    });
    const datesObject = makeUrlDates()
    const fuelModelReq = getFuelModel(sig).fMod
    var obType = getFuelModel(sig).type
    const user = getFuelModel(sig).user ? getFuelModel(sig).user : 679
    const nfdrsUrl = `https://famprod.nwcg.gov/wims/xsql/nfdrs.xsql?stn=&sig=${sig}&type=${obType}&start=${datesObject.day1}&end=${datesObject.day7}&time=&user=${user}&fmodel=${fuelModelReq}`
    const wimsNfdrsRequest = await axios.get(nfdrsUrl)
    var stringParseNfdrs = await parseStringSync(wimsNfdrsRequest.data)

    const wxUrl = `https://famprod.nwcg.gov/wims/xsql/pfcst.xsql?stn=&sig=${sig}&type=F&start=${datesObject.day1}&end=${datesObject.day7}&time=&user=${user}&fmodel=${fuelModelReq}`
    const wimsWxRequest = await axios.get(wxUrl)
    var stringParseWx = await parseStringSync(wimsWxRequest.data)
    console.log(nfdrsUrl)
    console.log(wxUrl)
    const dateArray = makeDateRangeArray() //all the dates to return in text file
    const wxObj = wimsToObj(stringParseWx.pfcst.row, 'wx')
    const nfdrsObj = wimsToObj(stringParseNfdrs.nfdrs.row, 'nfdrs')
    console.log(nfdrsObj)

    const stns = Object.keys(nfdrsObj)
    console.log(JSON.stringify(stns))
    const fullObj = {}
    const nameArray = [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']
    const blankName = '                    '
    const blankStnId = '        '
    var fullString = ''
    // console.log('date', new Date(dateArray[2]))
    const currMonth = new Date(dateArray[2]).getMonth()+1 < 10 ? `0${new Date(dateArray[2]).getMonth()+1}` : new Date(dateArray[2]).getMonth()+1
    const timeStamp = `${new Date(dateArray[2]).getFullYear()}${currMonth}${new Date(dateArray[2]).getDate()}`

    stns.map(currStn => {
      const currDatNfdrs = nfdrsObj[currStn]
      const metadata = {sta_nm: currDatNfdrs.sta_nm, latitude: currDatNfdrs.latitude, longitude: currDatNfdrs.longitude}
      const currNameAr = Array.from(metadata.sta_nm)
      fullObj[currStn] = {metadata}
      dateArray.map(currDate => {
        const currMonth = new Date(currDate).getMonth()+1 < 10 ? `0${new Date(currDate).getMonth()+1}` : new Date(currDate).getMonth()+1
        const currDay = new Date(currDate).getDate() < 10 ? `0${new Date(currDate).getDate()}` : new Date(currDate).getDate()
        const currDateFormatted = `${currMonth}/${currDay}/${new Date(currDate).getFullYear()}`
        console.log('currDateFor', currDateFormatted)
        const currNfdrs =  nfdrsObj[currStn][currDateFormatted]
        const currWx =  wxObj[currStn][currDateFormatted]
        console.log(currNfdrs)
        if(!fullObj[currStn]['data']){
          fullObj[currStn]['data'] = {}
        }
        fullObj[currStn]['data'][currDateFormatted] = { ...currWx, ...currNfdrs}
      })
      const testObj = fullObj[currStn]
      const lat = parseFloat(testObj['metadata']['latitude']).toFixed(3)
      const lon = parseFloat(testObj['metadata']['longitude']).toFixed(3)
      const properSpacesName = addEnoughSpaces(`*${testObj['metadata']['sta_nm']}`, 20)
      const properSpacesId = addEnoughSpaces(`${currStn}`, 8)
      const properSpacesLat = addEnoughSpaces(lat, 8)
      const properSpacesLon = addEnoughSpaces(lon, 9)
      var stnString = `\n\n${properSpacesName}${properSpacesId}${properSpacesLat} ${properSpacesLon}${timeStamp}  21   \nFcst Dy             `
      const dates = Object.keys(testObj.data)
      console.log('dates', dates)
      const formattedDates = dates.map(currDate => {
        const isoDate = new Date(currDate).toISOString()
        const inFormat = isoDate.slice(5,10).replace('-','/')
        stnString += addEnoughSpaces(inFormat, 9)
        return addEnoughSpaces(inFormat, 9)
        return isoDate.slice(5,10).replace('-','/')
      })
      
      for(var element in stnConfig.longNames){
        dates.map((currDate, i) => {
          if(i == 0){
            // console.log(stnConfig['longNames'][element])
            const elementLabel = addEnoughSpaces(stnConfig['longNames'][element], 23)
            stnString += '\n'+elementLabel
          }
          const val =  testObj.data[currDate][element] ? parseFloat(testObj.data[currDate][element]).toFixed(0).toString() : stnConfig.noData
          console.log('val', val)
          stnString += addEnoughSpaces(val, 9)
          if(i == dates.length){
            stnString += '\n\n'
          }
        })
      }

      for(var key in stnConfig.longNames){
        const val = stnConfig.longNames[key]
      }

      fullString += stnString
      
    })
console.log(fullString)
    // var fileName = 'psTest'
    var fileName = '7daydata'
      var filePath = `./data/${fileName}.txt`
      const uploadParams = { Bucket: '7daydata', Key: '7daydata.txt', Body: fullString, ACL:'public-read' }
      const uploaded = await s3.upload(uploadParams).promise()
      console.log('file uploaded', uploaded)
      // fs.writeFile(filePath, fullString, (err) => {
      //   if (err) return console.log(err)
      //   console.log('saved', fileName)  
      // })
    
  }
  catch(e){
    console.log('error in request and process wims data', e)
  }
}
const addEnoughSpaces = (string, length) => {
  var emptyAr = []
  var i = 0
  while (i<length){
    emptyAr.push(' ')
    i++
  }
  const emptyString = emptyAr.join('')
  const addThis = emptyString.substr(string.length)
  const fullName = `${string + addThis}`
  return fullName
}

const wimsToObj = (data, type)=>{
  const wimsObj = {}
  const varKey = type == 'nfdrs' ? 'nfdrsVars' : 'wxVars'
  const dateNm = type == 'nfdrs' ? 'nfdr_dt' : 'fcst_dt'
  data.map(curr=>{
    const obObj = {}
    stnConfig[varKey].map(currVar => {
      obObj[currVar] = curr[currVar][0]
    })
    const currId = curr.sta_id[0]
    const currDate = curr[dateNm][0]
    const objKeys = Object.keys(wimsObj)
    if(objKeys.indexOf(currId) < 0){
      wimsObj[currId] = {}
      wimsObj[currId]['sta_nm'] = curr.sta_nm[0]
      wimsObj[currId]['latitude'] = curr.latitude[0]
      wimsObj[currId]['longitude'] = curr.longitude[0]
      wimsObj[currId][currDate]=obObj
    }
    else{
      const currDates = Object.keys(wimsObj[currId])
      if(currDates.indexOf(currDate)<1){
        wimsObj[currId][currDate]=obObj
      }
    }
  })
  return wimsObj
}

var makeUrlDates = () =>{
  var getMonthName = (monthNumber) =>{
    var nameObj = {
      0:'JAN',
      1:'FEB',
      2:'MAR',
      3:'APR',
      4:'MAY',
      5:'JUN',
      6:'JUL',
      7:'AUG',
      8:'SEP',
      9:'OCT', 
      10:'NOV',
      11:'DEC'
    }
    return nameObj[monthNumber]
  }
  var d1  = new Date().getTime() - 86400000
  var d7  = new Date().getTime() + (10 * 86400000)

  dateObj = {
    day1:new Date(d1).getUTCDate() + '-' + getMonthName(new Date(d1).getUTCMonth()) + '-' + new Date(d1).getUTCFullYear().toString().substring(2),
    day7:new Date(d7).getUTCDate() + '-' + getMonthName(new Date(d7).getUTCMonth()) + '-' + new Date(d7).getUTCFullYear().toString().substring(2),
  }  

  return dateObj
}

var getFuelModel = (sig) => {
  var centerModels = {
   ALL_GB: {
     fMod: '7G',
     // type: 'O,R',
     type: 'F',
     user:679
   },
   EACC: {
     fMod: '7G',
     type: 'O,R',
     user:'smarien'
   },
   NRNROCKT: {
     fMod: '',
     type: 'N',
     user:679
   }
  }
  return centerModels[sig]
}

const makeDateRangeArray = () =>{
  const now = new Date()
  const initDate = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`).getTime()
  const dateArray = [initDate - 86400000] //initialize with yesterday so don't have to deal with subtraction in while loop
  var i = 0
  while(i<10){
    dateArray.push(initDate + (86400000 * i))
    i++
  }
  return dateArray
}

const stnConfig = {
  nfdrsVars: ['bi', 'ec', 'ic', 'ten_hr', 'hu_hr', 'th_hr'],
  wxVars: ['rh_max', 'temp_min', 'rh_min', 'temp_max', 'wind_sp'],
  allVars: ['rh_max', 'temp_min', 'rh_min', 'temp_max', 'wind_sp','bi', 'ec', 'ic', 'ten_hr', 'hu_hr', 'th_hr'],
  longNames:{
    // dayRow:'Fcst Dy',
    rh_max:'Max RH (%)',
    temp_min: 'Min Temp (F)',
    rh_min:'Min RH (%)',
    temp_max: 'Max Temp (F)',
    wind_sp: 'WSpd (knt)', 
    bi: 'BI', 
    ec: 'ERC', 
    ic: 'IC', 
    ten_hr: '10-hr fuel (%)', 
    hu_hr: '100-hr fuel (%)', 
    th_hr: '1000-hr fuel (%)' 
  },
  noData: ' '
}

// requestAndProcessWimsData('ALL_GB')
module.exports = requestAndProcessWimsData

