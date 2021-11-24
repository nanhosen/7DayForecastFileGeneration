function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var stnAr = [0,1,2,3,4,5]

const testFn = async() =>{
  for(var stn in stnAr){
    console.log('stn', stn)
    await sleep(1000)
  }
}

testFn()