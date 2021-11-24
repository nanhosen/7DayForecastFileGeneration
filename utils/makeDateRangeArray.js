const makeDateRangeArray = () => {
  const now = new Date()
  const initDate = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`).getTime()
  const dateArray = [initDate - 86400000] //initialize with yesterday so don't have to deal with subtraction in while loop
  var i = 0
  while (i < 10) {
    dateArray.push(initDate + (86400000 * i))
    i++
  }
  return dateArray
}

module.exports = makeDateRangeArray