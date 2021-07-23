# Period
## Install
`npm i --save @darkwolf/period`
## Usage
```javascript
// ECMAScript
import Period from '@darkwolf/period'
// CommonJS
const Period = require('@darkwolf/period')

`${Period.between('1970-01-01T00:00:00Z', '2038-01-19T03:14:07Z')}` // => 'P68Y18DT3H14M7S'
`${Period.between('2038-01-19T03:14:07Z', '1970-01-01T00:00:00Z')}` // => '-P68Y18DT3H14M7S'
`${Period.between('1900-12-31T23:59:59.999999999Z', '2021-07-13T23:59:59.999999999Z')}` // => 'P120Y6M13D'
`${Period.between('2021-07-13T23:59:59.999999999Z', '1900-12-31T23:59:59.999999999Z')}` // => '-P120Y6M13D'

`${new Period('1 year 1 quarter 1 month 1 week 1 day 23 hours 59 minutes 59 seconds 999 milliseconds 999 microseconds 999 nanoseconds')}` // => 'P1Y4M8DT23H59M59.999999999S'
`${new Period('P1Y1Q1M1W1DT23H59M59.999999999S')}` // => 'P1Y4M8DT23H59M59.999999999S'
`${new Period()
  .addYears(1)
  .addQuarters(1)
  .addMonths(1)
  .addWeeks(1)
  .addDays(1)
  .addHours(23)
  .addMinutes(59)
  .addSeconds(59)
  .addMillis(999)
  .addMicros(999)
  .addNanos(999)
}` // => 'P1Y4M8DT23H59M59.999999999S'
`${Period.from({
  years: 1,
  quarters: 1,
  months: 1,
  weeks: 1,
  days: 1,
  hours: 23,
  minutes: 59,
  seconds: 59,
  milliseconds: 999,
  microseconds: 999,
  nanoseconds: 999
})}` // => 'P1Y4M8DT23H59M59.999999999S'
```
## [API Documentation](https://github.com/Darkwolf/node-period/blob/master/docs/API.md)
## Contact Me
#### GitHub: [@PavelWolfDark](https://github.com/PavelWolfDark)
#### Telegram: [@PavelWolfDark](https://t.me/PavelWolfDark)
#### Email: [PavelWolfDark@gmail.com](mailto:PavelWolfDark@gmail.com)
