const makeUrlDates = () => {
  var getMonthName = (monthNumber) => {
    var nameObj = {
      0: 'JAN',
      1: 'FEB',
      2: 'MAR',
      3: 'APR',
      4: 'MAY',
      5: 'JUN',
      6: 'JUL',
      7: 'AUG',
      8: 'SEP',
      9: 'OCT',
      10: 'NOV',
      11: 'DEC'
    }
    return nameObj[monthNumber]
  }
  var d1 = new Date().getTime() - 86400000
  var d7 = new Date().getTime() + (10 * 86400000)

  dateObj = {
    day1: new Date(d1).getUTCDate() + '-' + getMonthName(new Date(d1).getUTCMonth()) + '-' + new Date(d1).getUTCFullYear().toString().substring(2),
    day7: new Date(d7).getUTCDate() + '-' + getMonthName(new Date(d7).getUTCMonth()) + '-' + new Date(d7).getUTCFullYear().toString().substring(2),
  }
  console.log('datePbk', dateObj)

  return dateObj
}

module.exports = makeUrlDates