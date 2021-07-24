const {
  uncurryThis,
  ObjectDefineProperties,
  FunctionPrototypeApply,
  FunctionPrototypeBind,
  FunctionPrototypeSymbolHasInstance,
  Symbol,
  SymbolToPrimitive,
  SymbolToStringTag,
  RangeError,
  TypeError,
  Number,
  NumberIsFinite,
  NumberPrototypeToFixed,
  MathRound,
  MathTrunc,
  String,
  StringPrototypeIncludes,
  StringPrototypeSlice,
  PrimitivesIsString,
  InstancesIsDate,
  TypesIsPlainObject,
  TypesToNumber
} = require('@darkwolf/primordials')
const Duration = require('@darkwolf/duration')
const Timestamp = require('@darkwolf/timestamp')
const {
  NEGATIVE_CHAR,
  SEPARATOR_CHAR,
  NANOSECONDS_PER_MICROSECOND,
  MICROSECONDS_PER_MILLISECOND,
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  DAYS_PER_WEEK,
  MONTHS_PER_QUARTER,
  MONTHS_PER_YEAR,
  UNIT,
  ROUNDING_MODE,
  isDuration: DurationIsDuration,
  toUnit: DurationToUnit,
  getUnitIndex: DurationGetUnitIndex,
  convert: DurationConvert,
  slotsToParts: DurationSlotsToParts,
  convertToParts: DurationConvertToParts,
  partsToDuration: DurationPartsToDuration,
  partsToSlots: DurationPartsToSlots,
  parseUnitsToParts: DurationParseUnitsToParts,
  parseTimeToParts: DurationParseTimeToParts,
  parseDurationToParts: DurationParseDurationToParts,
  parseToParts: DurationParseToParts,
  dateToSlots: DurationDateToSlots
} = Duration
const {
  isTimestamp: TimestampIsTimestamp,
  getDaysInMonth: TimestampGetDaysInMonth,
  from: TimestampFrom
} = Timestamp

const DurationPrototypeToSlots = uncurryThis(Duration.prototype.toSlots)
const TimestampPrototypeCompare = uncurryThis(Timestamp.prototype.compare)
const TimestampPrototypeToSlots = uncurryThis(Timestamp.prototype.toSlots)
const TimestampPrototypeToFields = uncurryThis(Timestamp.prototype.toFields)

const yearsSymbol = Symbol('years')
const monthsSymbol = Symbol('months')
const daysSymbol = Symbol('days')
const hoursSymbol = Symbol('hours')
const minutesSymbol = Symbol('minutes')
const secondsSymbol = Symbol('seconds')
const millisecondsSymbol = Symbol('milliseconds')
const microsecondsSymbol = Symbol('microseconds')
const nanosecondsSymbol = Symbol('nanoseconds')
const addSymbol = Symbol('add')
const subtractSymbol = Symbol('subtract')
const toStringSymbol = Symbol('toString')

const toAmount = (value, unit) => {
  value = TypesToNumber(value)
  if (!NumberIsFinite(value)) {
    throw new RangeError(`The ${unit} must be a finite number`)
  }
  return value || 0
}

const toParts = value => {
  if (!TypesIsPlainObject(value)) {
    throw new TypeError('The parts must be a plain object')
  }
  let {
    years,
    quarters,
    months,
    weeks,
    days
  } = value
  if (years !== undefined) {
    years = toAmount(years, 'years')
  }
  if (quarters !== undefined) {
    quarters = toAmount(quarters, 'quarters')
  }
  if (months !== undefined) {
    months = toAmount(months, 'months')
  }
  if (weeks !== undefined) {
    weeks = toAmount(weeks, 'weeks')
  }
  if (days !== undefined) {
    days = toAmount(days, 'days')
  }
  return {
    ...value,
    years,
    quarters,
    months,
    weeks,
    days
  }
}

const toPartsOptions = value => {
  if (value === undefined) {
    return {
      largestUnit: 'year',
      smallestUnit: 'nanosecond',
    }
  } else if (!TypesIsPlainObject(value)) {
    throw new TypeError('The options must be a plain object')
  }
  let {
    largestUnit,
    smallestUnit,
  } = value
  if (largestUnit === undefined) {
    largestUnit = 'year'
  }
  if (smallestUnit === undefined) {
    smallestUnit = 'nanosecond'
  }
  return {
    ...value,
    largestUnit,
    smallestUnit
  }
}

const numberToString = (number, digits = 9) => {
  const string = NumberPrototypeToFixed(number, digits)
  if (StringPrototypeIncludes(string, SEPARATOR_CHAR)) {
    const {length} = string
    const lastIndex = length - 1
    let zeroCount = 0
    while (string[lastIndex - zeroCount] === '0') {
      zeroCount++
    }
    if (string[lastIndex - zeroCount] === SEPARATOR_CHAR) {
      zeroCount++
    }
    if (zeroCount) {
      return StringPrototypeSlice(string, 0, -zeroCount)
    }
  }
  return string
}

const _wrapSlots = slots => {
  let {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  } = slots
  let totalMonths = 0
  if (years !== undefined) {
    totalMonths += years * MONTHS_PER_YEAR
  }
  if (months !== undefined) {
    totalMonths += months
  }
  totalMonths = MathRound(totalMonths)
  if (totalMonths) {
    years = MathTrunc(totalMonths / MONTHS_PER_YEAR) || 0
    months = totalMonths % MONTHS_PER_YEAR || 0
  } else {
    years = 0
    months = 0
  }
  const durationSlots = DurationPartsToSlots({
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  })
  const parts = DurationSlotsToParts(durationSlots, {
    largestUnit: 'day'
  })
  return {
    years,
    months,
    ...parts
  }
}
const wrapSlots = slots => {
  if (!TypesIsPlainObject(slots)) {
    throw new TypeError('The slots must be a plain object')
  }
  let {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  } = slots
  years = toAmount(years, 'years')
  months = toAmount(months, 'months')
  days = toAmount(days, 'days')
  hours = toAmount(hours, 'hours')
  minutes = toAmount(minutes, 'minutes')
  seconds = toAmount(seconds, 'seconds')
  milliseconds = toAmount(milliseconds, 'milliseconds')
  microseconds = toAmount(microseconds, 'microseconds')
  nanoseconds = toAmount(nanoseconds, 'nanoseconds')
  return _wrapSlots({
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  })
}

const _convertToSlots = (amount, unit) => {
  const unitIndex = DurationGetUnitIndex(unit)
  if (unitIndex > 7) {
    const totalMonths = DurationConvert(amount, unit, 'month', {
      rounding: true,
      roundingMode: 'round'
    })
    const years = MathTrunc(totalMonths / MONTHS_PER_YEAR) || 0
    const months = totalMonths % MONTHS_PER_YEAR || 0
    return {
      years,
      months,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      microseconds: 0,
      nanoseconds: 0
    }
  } else {
    const parts = DurationConvertToParts(amount, unit, {
      largestUnit: 'day'
    })
    return {
      years: 0,
      months: 0,
      ...parts
    }
  }
}
const convertToSlots = (amount, unit) => {
  unit = DurationToUnit(unit)
  amount = toAmount(amount, `${unit}s`)
  return _convertToSlots(amount, unit)
}

const _slotsToParts = (slots, options) => {
  let {
    largestUnit,
    smallestUnit,
    roundingMode,
    withQuarters,
    withWeeks
  } = options
  const largestUnitIndex = DurationGetUnitIndex(largestUnit)
  const smallestUnitIndex = DurationGetUnitIndex(smallestUnit)
  if (largestUnitIndex < 10) {
    largestUnit = 'month'
  }
  if (smallestUnitIndex > 6) {
    smallestUnit = 'day'
  }
  const totalMonths = slots.years * MONTHS_PER_YEAR + slots.months
  let years
  let quarters
  let months
  let weeks
  if (largestUnit === 'year') {
    years = MathTrunc(totalMonths / MONTHS_PER_YEAR) || 0
    months = totalMonths % MONTHS_PER_YEAR || 0
  } else {
    months = totalMonths
  }
  if (withQuarters) {
    quarters = MathTrunc(months / MONTHS_PER_QUARTER) || 0
    months = months % MONTHS_PER_QUARTER || 0
  }
  const durationSlots = DurationPartsToSlots({
    days: slots.days,
    hours: slots.hours,
    minutes: slots.minutes,
    seconds: slots.seconds,
    milliseconds: slots.milliseconds,
    microseconds: slots.microseconds,
    nanoseconds: slots.nanoseconds
  })
  let {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  } = DurationSlotsToParts(durationSlots, {
    largestUnit: 'day',
    smallestUnit,
    rounding: true,
    roundingMode
  })
  if (withWeeks) {
    weeks = MathTrunc(days / DAYS_PER_WEEK) || 0
    days = days % DAYS_PER_WEEK || 0
  }
  const parts = {}
  if (years !== undefined) {
    parts.years = years
  }
  if (quarters !== undefined) {
    parts.quarters = quarters
  }
  parts.months = months
  if (weeks !== undefined) {
    parts.weeks = weeks
  }
  parts.days = days
  if (hours !== undefined) {
    parts.hours = hours
  }
  if (minutes !== undefined) {
    parts.minutes = minutes
  }
  if (seconds !== undefined) {
    parts.seconds = seconds
  }
  if (milliseconds !== undefined) {
    parts.milliseconds = milliseconds
  }
  if (microseconds !== undefined) {
    parts.microseconds = microseconds
  }
  if (nanoseconds !== undefined) {
    parts.nanoseconds = nanoseconds
  }
  return parts
}
const slotsToParts = (slots, options) => {
  options = toPartsOptions(options)
  slots = wrapSlots(slots)
  return _slotsToParts(slots, options)
}

const _partsToSlots = parts => {
  let {
    years,
    quarters,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  } = parts
  if (quarters) {
    if (months === undefined) {
      months = 0
    }
    months += quarters * MONTHS_PER_QUARTER
  }
  if (weeks) {
    if (days === undefined) {
      days = 0
    }
    days += weeks * DAYS_PER_WEEK
  }
  return _wrapSlots({
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  })
}
const partsToSlots = parts => {
  parts = toParts(parts)
  return _partsToSlots(parts)
}

const parseUnits = (string, options) => {
  options = toPartsOptions(options)
  const parts = DurationParseUnitsToParts(string)
  if (!parts) {
    return null
  }
  const slots = _partsToSlots(parts)
  return _slotsToParts(slots, options)
}

const parseTime = (string, options) => {
  options = toPartsOptions(options)
  const parts = DurationParseTimeToParts(string)
  if (!parts) {
    return null
  }
  const slots = _partsToSlots(parts)
  return _slotsToParts(slots, options)
}

const parsePeriod = (string, options) => {
  options = toPartsOptions(options)
  const parts = DurationParseDurationToParts(string)
  if (!parts) {
    return null
  }
  const slots = _partsToSlots(parts)
  return _slotsToParts(slots, options)
}

const parse = (string, options) => {
  options = toPartsOptions(options)
  const parts = DurationParseToParts(string)
  if (!parts) {
    return null
  }
  const slots = _partsToSlots(parts)
  return _slotsToParts(slots, options)
}

const periodToSlots = period => {
  let slots = null
  if (PrimitivesIsString(period)) {
    const parts = DurationParseToParts(period)
    if (parts) {
      slots = _partsToSlots(parts)
    }
  }
  if (!slots) {
    period = TypesToNumber(period)
    if (!NumberIsFinite(period)) {
      throw new RangeError('The period must be a finite number')
    }
    slots = _wrapSlots({
      seconds: period
    })
  }
  return slots
}

const toSlots = input => {
  if (isPeriod(input)) {
    return {
      years: input[yearsSymbol],
      months: input[monthsSymbol],
      days: input[daysSymbol],
      hours: input[hoursSymbol],
      minutes: input[minutesSymbol],
      seconds: input[secondsSymbol],
      milliseconds: input[millisecondsSymbol],
      microseconds: input[microsecondsSymbol],
      nanoseconds: input[nanosecondsSymbol]
    }
  }
  if (DurationIsDuration(input)) {
    const slots = DurationPrototypeToSlots(input)
    return _wrapSlots(slots)
  }
  if (TimestampIsTimestamp(input)) {
    const slots = TimestampPrototypeToSlots(input)
    return _wrapSlots(slots)
  }
  if (InstancesIsDate(input)) {
    const slots = DurationDateToSlots(input)
    return _wrapSlots(slots)
  }
  return TypesIsPlainObject(input) ? partsToSlots(input) : periodToSlots(input)
}

const between = (timestamp1, timestamp2) => {
  timestamp1 = TimestampFrom(timestamp1)
  timestamp2 = TimestampFrom(timestamp2)
  const sign = TimestampPrototypeCompare(timestamp1, timestamp2)
  if (!sign) {
    return new Period()
  }
  const isNegative = sign > 0
  let fields1
  let fields2
  if (isNegative) {
    fields1 = TimestampPrototypeToFields(timestamp2)
    fields2 = TimestampPrototypeToFields(timestamp1)
  } else {
    fields1 = TimestampPrototypeToFields(timestamp1)
    fields2 = TimestampPrototypeToFields(timestamp2)
  }
  const {
    day
  } = fields1
  const {
    year,
    month
  } = fields2
  let years = year - fields1.year
  let months = month - fields1.month
  let days = fields2.day - day
  let hours = fields2.hour - fields1.hour
  let minutes = fields2.minute - fields1.minute
  let seconds = fields2.second - fields1.second
  let milliseconds = fields2.millisecond - fields1.millisecond
  let microseconds = fields2.microsecond - fields1.microsecond
  let nanoseconds = fields2.nanosecond - fields1.nanosecond
  if (nanoseconds < 0) {
    nanoseconds = NANOSECONDS_PER_MICROSECOND + nanoseconds
    microseconds--
  }
  if (microseconds < 0) {
    microseconds = MICROSECONDS_PER_MILLISECOND + microseconds
    milliseconds--
  }
  if (milliseconds < 0) {
    milliseconds = MILLISECONDS_PER_SECOND + milliseconds
    seconds--
  }
  if (seconds < 0) {
    seconds = SECONDS_PER_MINUTE + seconds
    minutes--
  }
  if (minutes < 0) {
    minutes = MINUTES_PER_HOUR + minutes
    hours--
  }
  if (hours < 0) {
    hours = HOURS_PER_DAY + hours
    days--
  }
  if (days < 0) {
    const daysInMonth = TimestampGetDaysInMonth(year, month - 1)
    days += daysInMonth
    if (daysInMonth < day) {
      days += day - daysInMonth
    }
    months--
  }
  if (months < 0) {
    months = MONTHS_PER_YEAR + months
    years--
  }
  return new Period(
    isNegative ? -years : years,
    isNegative ? -months : months,
    isNegative ? -days : days,
    isNegative ? -hours : hours,
    isNegative ? -minutes : minutes,
    isNegative ? -seconds : seconds,
    isNegative ? -milliseconds : milliseconds,
    isNegative ? -microseconds : microseconds,
    isNegative ? -nanoseconds : nanoseconds
  )
}

const of = (amount, unit) => {
  const slots = convertToSlots(amount, unit)
  return new Period(
    slots.years,
    slots.months,
    slots.days,
    slots.hours,
    slots.minutes,
    slots.seconds,
    slots.milliseconds,
    slots.microseconds,
    slots.nanoseconds
  )
}
const ofNanoseconds = nanoseconds => of(nanoseconds, 'nanosecond')
const ofNanos = ofNanoseconds
const ofMicroseconds = microseconds => of(microseconds, 'microsecond')
const ofMicros = ofMicroseconds
const ofMilliseconds = milliseconds => of(milliseconds, 'millisecond')
const ofMillis = ofMilliseconds
const ofSeconds = seconds => of(seconds, 'second')
const ofMinutes = minutes => of(minutes, 'minute')
const ofHours = hours => of(hours, 'hour')
const ofDays = days => of(days, 'day')
const ofWeeks = weeks => of(weeks, 'week')
const ofMonths = months => of(months, 'month')
const ofQuarters = quarters => of(quarters, 'quarter')
const ofYears = years => of(years, 'year')

const _fromParts = parts => {
  const slots = _partsToSlots(parts)
  return new Period(
    slots.years,
    slots.months,
    slots.days,
    slots.hours,
    slots.minutes,
    slots.seconds,
    slots.milliseconds,
    slots.microseconds,
    slots.nanoseconds
  )
}
const fromParts = parts => {
  parts = toParts(parts)
  return _fromParts(parts)
}

const from = input => {
  const slots = toSlots(input)
  return new Period(
    slots.years,
    slots.months,
    slots.days,
    slots.hours,
    slots.minutes,
    slots.seconds,
    slots.milliseconds,
    slots.microseconds,
    slots.nanoseconds
  )
}

class Period {
  constructor(...args) {
    const {length} = args
    if (!length) {
      this[yearsSymbol] = 0
      this[monthsSymbol] = 0
      this[daysSymbol] = 0
      this[hoursSymbol] = 0
      this[minutesSymbol] = 0
      this[secondsSymbol] = 0
      this[millisecondsSymbol] = 0
      this[microsecondsSymbol] = 0
      this[nanosecondsSymbol] = 0
    } else if (length === 1) {
      const [period] = args
      const slots = periodToSlots(period)
      this[yearsSymbol] = slots.years
      this[monthsSymbol] = slots.months
      this[daysSymbol] = slots.days
      this[hoursSymbol] = slots.hours
      this[minutesSymbol] = slots.minutes
      this[secondsSymbol] = slots.seconds
      this[millisecondsSymbol] = slots.milliseconds
      this[microsecondsSymbol] = slots.microseconds
      this[nanosecondsSymbol] = slots.nanoseconds
    } else if (length === 2) {
      const [seconds, nanoseconds] = args
      const slots = _wrapSlots({
        seconds,
        nanoseconds
      })
      this[yearsSymbol] = slots.years
      this[monthsSymbol] = slots.months
      this[daysSymbol] = slots.days
      this[hoursSymbol] = slots.hours
      this[minutesSymbol] = slots.minutes
      this[secondsSymbol] = slots.seconds
      this[millisecondsSymbol] = slots.milliseconds
      this[microsecondsSymbol] = slots.microseconds
      this[nanosecondsSymbol] = slots.nanoseconds
    } else {
      let [
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
        microseconds,
        nanoseconds
      ] = args
      years = toAmount(years, 'years')
      months = toAmount(months, 'months')
      days = toAmount(days, 'days')
      hours = length > 3 ? toAmount(hours, 'hours') : 0
      minutes = length > 4 ? toAmount(minutes, 'minutes') : 0
      seconds = length > 5 ? toAmount(seconds, 'seconds') : 0
      milliseconds = length > 6 ? toAmount(milliseconds, 'milliseconds') : 0
      microseconds = length > 7 ? toAmount(microseconds, 'microseconds') : 0
      nanoseconds = length > 8 ? toAmount(nanoseconds, 'nanoseconds') : 0
      const slots = _wrapSlots({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
        microseconds,
        nanoseconds
      })
      this[yearsSymbol] = slots.years
      this[monthsSymbol] = slots.months
      this[daysSymbol] = slots.days
      this[hoursSymbol] = slots.hours
      this[minutesSymbol] = slots.minutes
      this[secondsSymbol] = slots.seconds
      this[millisecondsSymbol] = slots.milliseconds
      this[microsecondsSymbol] = slots.microseconds
      this[nanosecondsSymbol] = slots.nanoseconds
    }
  }

  get years() {
    return this[yearsSymbol]
  }

  get months() {
    return this[monthsSymbol]
  }

  get days() {
    return this[daysSymbol]
  }

  get hours() {
    return this[hoursSymbol]
  }

  get minutes() {
    return this[minutesSymbol]
  }

  get seconds() {
    return this[secondsSymbol]
  }

  get milliseconds() {
    return this[millisecondsSymbol]
  }

  get microseconds() {
    return this[microsecondsSymbol]
  }

  get nanoseconds() {
    return this[nanosecondsSymbol]
  }

  get isNegative() {
    return (
      this[yearsSymbol] < 0 ||
      this[monthsSymbol] < 0 ||
      this[daysSymbol] < 0 ||
      this[hoursSymbol] < 0 ||
      this[minutesSymbol] < 0 ||
      this[secondsSymbol] < 0 ||
      this[millisecondsSymbol] < 0 ||
      this[microsecondsSymbol] < 0 ||
      this[nanosecondsSymbol] < 0
    )
  }

  get sign() {
    const years = this[yearsSymbol]
    const months = this[monthsSymbol]
    const days = this[daysSymbol]
    const hours = this[hoursSymbol]
    const minutes = this[minutesSymbol]
    const seconds = this[secondsSymbol]
    const milliseconds = this[millisecondsSymbol]
    const microseconds = this[microsecondsSymbol]
    const nanoseconds = this[nanosecondsSymbol]
    return (
      years < 0 ||
      months < 0 ||
      days < 0 ||
      hours < 0 ||
      minutes < 0 ||
      seconds < 0 ||
      milliseconds < 0 ||
      microseconds < 0 ||
      nanoseconds < 0
    ) ? -1 : (
      years > 0 ||
      months > 0 ||
      days > 0 ||
      hours > 0 ||
      minutes > 0 ||
      seconds > 0 ||
      milliseconds > 0 ||
      microseconds > 0 ||
      nanoseconds > 0
    ) ? 1 : 0
  }

  withYears(years) {
    return new Period(
      years,
      this[monthsSymbol],
      this[daysSymbol],
      this[hoursSymbol],
      this[minutesSymbol],
      this[secondsSymbol],
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withMonths(months) {
    return new Period(
      this[yearsSymbol],
      months,
      this[daysSymbol],
      this[hoursSymbol],
      this[minutesSymbol],
      this[secondsSymbol],
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withDays(days) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      days,
      this[hoursSymbol],
      this[minutesSymbol],
      this[secondsSymbol],
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withHours(hours) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      this[daysSymbol],
      hours,
      this[minutesSymbol],
      this[secondsSymbol],
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withMinutes(minutes) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      this[daysSymbol],
      this[hoursSymbol],
      minutes,
      this[secondsSymbol],
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withSeconds(seconds) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      this[daysSymbol],
      this[hoursSymbol],
      this[minutesSymbol],
      seconds,
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withMilliseconds(milliseconds) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      this[daysSymbol],
      this[hoursSymbol],
      this[minutesSymbol],
      this[secondsSymbol],
      milliseconds,
      this[microsecondsSymbol],
      this[nanosecondsSymbol]
    )
  }

  withMicroseconds(microseconds) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      this[daysSymbol],
      this[hoursSymbol],
      this[minutesSymbol],
      this[secondsSymbol],
      this[millisecondsSymbol],
      microseconds,
      this[nanosecondsSymbol]
    )
  }

  withNanoseconds(nanoseconds) {
    return new Period(
      this[yearsSymbol],
      this[monthsSymbol],
      this[daysSymbol],
      this[hoursSymbol],
      this[minutesSymbol],
      this[secondsSymbol],
      this[millisecondsSymbol],
      this[microsecondsSymbol],
      nanoseconds
    )
  }

  [addSymbol](...args) {
    let slots = null
    if (args.length > 1) {
      const [amount, unit] = args
      slots = convertToSlots(amount, unit)
    } else {
      const [input] = args
      slots = toSlots(input)
    }
    const years = this[yearsSymbol] + slots.years
    const months = this[monthsSymbol] + slots.months
    const days = this[daysSymbol] + slots.days
    const hours = this[hoursSymbol] + slots.hours
    const minutes = this[minutesSymbol] + slots.minutes
    const seconds = this[secondsSymbol] + slots.seconds
    const milliseconds = this[millisecondsSymbol] + slots.milliseconds
    const microseconds = this[microsecondsSymbol] + slots.microseconds
    const nanoseconds = this[nanosecondsSymbol] + slots.nanoseconds
    return new Period(
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    )
  }

  add(...args) {
    return FunctionPrototypeApply(this[addSymbol], this, args)
  }

  addNanoseconds(nanoseconds) {
    return this[addSymbol](nanoseconds, 'nanosecond')
  }

  addMicroseconds(microseconds) {
    return this[addSymbol](microseconds, 'microsecond')
  }

  addMilliseconds(milliseconds) {
    return this[addSymbol](milliseconds, 'millisecond')
  }

  addSeconds(seconds) {
    return this[addSymbol](seconds, 'second')
  }

  addMinutes(minutes) {
    return this[addSymbol](minutes, 'minute')
  }

  addHours(hours) {
    return this[addSymbol](hours, 'hour')
  }

  addDays(days) {
    return this[addSymbol](days, 'day')
  }

  addWeeks(weeks) {
    return this[addSymbol](weeks, 'week')
  }

  addMonths(months) {
    return this[addSymbol](months, 'month')
  }

  addQuarters(quarters) {
    return this[addSymbol](quarters, 'quarter')
  }

  addYears(years) {
    return this[addSymbol](years, 'year')
  }

  [subtractSymbol](...args) {
    let slots = null
    if (args.length > 1) {
      const [amount, unit] = args
      slots = convertToSlots(amount, unit)
    } else {
      const [input] = args
      slots = toSlots(input)
    }
    const years = this[yearsSymbol] - slots.years
    const months = this[monthsSymbol] - slots.months
    const days = this[daysSymbol] - slots.days
    const hours = this[hoursSymbol] - slots.hours
    const minutes = this[minutesSymbol] - slots.minutes
    const seconds = this[secondsSymbol] - slots.seconds
    const milliseconds = this[millisecondsSymbol] - slots.milliseconds
    const microseconds = this[microsecondsSymbol] - slots.microseconds
    const nanoseconds = this[nanosecondsSymbol] - slots.nanoseconds
    return new Period(
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    )
  }

  subtract(...args) {
    return FunctionPrototypeApply(this[subtractSymbol], this, args)
  }

  subtractNanoseconds(nanoseconds) {
    return this[subtractSymbol](nanoseconds, 'nanosecond')
  }

  subtractMicroseconds(microseconds) {
    return this[subtractSymbol](microseconds, 'microsecond')
  }

  subtractMilliseconds(milliseconds) {
    return this[subtractSymbol](milliseconds, 'millisecond')
  }

  subtractSeconds(seconds) {
    return this[subtractSymbol](seconds, 'second')
  }

  subtractMinutes(minutes) {
    return this[subtractSymbol](minutes, 'minute')
  }

  subtractHours(hours) {
    return this[subtractSymbol](hours, 'hour')
  }

  subtractDays(days) {
    return this[subtractSymbol](days, 'day')
  }

  subtractWeeks(weeks) {
    return this[subtractSymbol](weeks, 'week')
  }

  subtractMonths(months) {
    return this[subtractSymbol](months, 'month')
  }

  subtractQuarters(quarters) {
    return this[subtractSymbol](quarters, 'quarter')
  }

  subtractYears(years) {
    return this[subtractSymbol](years, 'year')
  }

  multiply(multiplier) {
    multiplier = TypesToNumber(multiplier)
    if (!NumberIsFinite(multiplier)) {
      throw new RangeError('The multiplier must be a finite number')
    }
    multiplier = MathTrunc(multiplier)
    if (!multiplier) {
      throw new RangeError('The multiplier must be greater or less than zero')
    }
    const years = this[yearsSymbol] * multiplier
    const months = this[monthsSymbol] * multiplier
    const days = this[daysSymbol] * multiplier
    const hours = this[hoursSymbol] * multiplier
    const minutes = this[minutesSymbol] * multiplier
    const seconds = this[secondsSymbol] * multiplier
    const milliseconds = this[millisecondsSymbol] * multiplier
    const microseconds = this[microsecondsSymbol] * multiplier
    const nanoseconds = this[nanosecondsSymbol] * multiplier
    return new Period(
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    )
  }

  negated() {
    return new Period(
      -this[yearsSymbol],
      -this[monthsSymbol],
      -this[daysSymbol],
      -this[hoursSymbol],
      -this[minutesSymbol],
      -this[secondsSymbol],
      -this[millisecondsSymbol],
      -this[microsecondsSymbol],
      -this[nanosecondsSymbol]
    )
  }

  round(options) {
    options = toPartsOptions(options)
    const parts = _slotsToParts({
      years: this[yearsSymbol],
      months: this[monthsSymbol],
      days: this[daysSymbol],
      hours: this[hoursSymbol],
      minutes: this[minutesSymbol],
      seconds: this[secondsSymbol],
      milliseconds: this[millisecondsSymbol],
      microseconds: this[microsecondsSymbol],
      nanoseconds: this[nanosecondsSymbol]
    }, options)
    return _fromParts(parts)
  }

  toSlots() {
    return {
      years: this[yearsSymbol],
      months: this[monthsSymbol],
      days: this[daysSymbol],
      hours: this[hoursSymbol],
      minutes: this[minutesSymbol],
      seconds: this[secondsSymbol],
      milliseconds: this[millisecondsSymbol],
      microseconds: this[microsecondsSymbol],
      nanoseconds: this[nanosecondsSymbol]
    }
  }

  toParts(options) {
    options = toPartsOptions(options)
    return _slotsToParts({
      years: this[yearsSymbol],
      months: this[monthsSymbol],
      days: this[daysSymbol],
      hours: this[hoursSymbol],
      minutes: this[minutesSymbol],
      seconds: this[secondsSymbol],
      milliseconds: this[millisecondsSymbol],
      microseconds: this[microsecondsSymbol],
      nanoseconds: this[nanosecondsSymbol]
    }, options)
  }

  [toStringSymbol](options) {
    options = toPartsOptions(options)
    let {
      largestUnit,
      smallestUnit,
      roundingMode,
      withQuarters,
      withWeeks
    } = options
    const largestUnitIndex = DurationGetUnitIndex(largestUnit)
    const smallestUnitIndex = DurationGetUnitIndex(smallestUnit)
    if (largestUnitIndex < 10) {
      largestUnit = 'month'
    }
    if (smallestUnitIndex > 6) {
      smallestUnit = 'day'
    }
    const totalMonths = this[yearsSymbol] * MONTHS_PER_YEAR + this[monthsSymbol]
    let years
    let quarters
    let months
    let weeks
    if (largestUnit === 'year') {
      years = MathTrunc(totalMonths / MONTHS_PER_YEAR) || 0
      months = totalMonths % MONTHS_PER_YEAR || 0
    } else {
      months = totalMonths
    }
    if (withQuarters) {
      quarters = MathTrunc(months / MONTHS_PER_QUARTER) || 0
      months = months % MONTHS_PER_QUARTER || 0
    }
    const durationSlots = DurationPartsToSlots({
      days: this[daysSymbol],
      hours: this[hoursSymbol],
      minutes: this[minutesSymbol],
      seconds: this[secondsSymbol],
      milliseconds: this[millisecondsSymbol],
      microseconds: this[microsecondsSymbol],
      nanoseconds: this[nanosecondsSymbol]
    })
    const {
      seconds: secondsSlot,
      nanoseconds: nanosecondsSlot
    } = durationSlots
    const sign = (secondsSlot > 0 || nanosecondsSlot > 0) ? 1 : (secondsSlot < 0 || nanosecondsSlot < 0) ? -1 : 0
    const isNegative = totalMonths < 0 && sign <= 0 || totalMonths <= 0 && sign < 0
    const isNegativeMonths = totalMonths < 0 && sign > 0
    const isNegativeDuration = totalMonths > 0 && sign < 0
    let {
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    } = DurationSlotsToParts(durationSlots, {
      largestUnit: 'day',
      smallestUnit,
      rounding: true,
      roundingMode
    })
    if (withWeeks) {
      weeks = MathTrunc(days / DAYS_PER_WEEK) || 0
      days = days % DAYS_PER_WEEK || 0
    }
    let result = 'P'
    if (years) {
      result += `${!isNegativeMonths && years < 0 ? -years : years}Y`
    }
    if (quarters) {
      result += `${!isNegativeMonths && quarters < 0 ? -quarters : quarters}Q`
    }
    if (months) {
      result += `${!isNegativeMonths && months < 0 ? -months : months}M`
    }
    if (weeks) {
      result += `${!isNegativeDuration && weeks < 0 ? -weeks : weeks}W`
    }
    if (days) {
      result += `${!isNegativeDuration && days < 0 ? -days : days}D`
    }
    if (hours) {
      result += `T${!isNegativeDuration && hours < 0 ? -hours : hours}H`
    }
    if (minutes) {
      if (!hours) {
        result += 'T'
      }
      result += `${!isNegativeDuration && minutes < 0 ? -minutes : minutes}M`
    }
    if (seconds || milliseconds || microseconds || nanoseconds) {
      if (!hours && !minutes) {
        result += 'T'
      }
      const duration = DurationPartsToDuration({
        seconds,
        milliseconds,
        microseconds,
        nanoseconds
      }, 'second')
      result += `${numberToString(!isNegativeDuration && duration < 0 ? -duration : duration)}S`
    }
    if (result.length === 1) {
      if (
        seconds !== undefined ||
        milliseconds !== undefined ||
        microseconds !== undefined ||
        nanoseconds !== undefined
      ) {
        result += 'T0S'
      } else if (minutes !== undefined) {
        result += 'T0M'
      } else if (hours !== undefined) {
        result += 'T0H'
      } else if (days !== undefined) {
        result += '0D'
      }
    } else if (isNegative) {
      result = `${NEGATIVE_CHAR}${result}`
    }
    return result
  }

  toString(options) {
    return this[toStringSymbol](options)
  }

  toJSON() {
    return this[toStringSymbol]()
  }

  valueOf() {
    return this[toStringSymbol]()
  }

  [SymbolToPrimitive](hint) {
    return this[toStringSymbol]()
  }
}

const isPeriod = FunctionPrototypeBind(FunctionPrototypeSymbolHasInstance, null, Period)

ObjectDefineProperties(Period, {
  NEGATIVE_CHAR: {
    value: NEGATIVE_CHAR
  },
  SEPARATOR_CHAR: {
    value: SEPARATOR_CHAR
  },
  UNIT: {
    value: UNIT
  },
  ROUNDING_MODE: {
    value: ROUNDING_MODE
  },
  isPeriod: {
    value: isPeriod
  },
  wrapSlots: {
    value: wrapSlots
  },
  convertToSlots: {
    value: convertToSlots
  },
  slotsToParts: {
    value: slotsToParts
  },
  partsToSlots: {
    value: partsToSlots
  },
  parseUnits: {
    value: parseUnits
  },
  parseTime: {
    value: parseTime
  },
  parsePeriod: {
    value: parsePeriod
  },
  parse: {
    value: parse
  },
  periodToSlots: {
    value: periodToSlots
  },
  toSlots: {
    value: toSlots
  },
  between: {
    value: between
  },
  of: {
    value: of
  },
  ofNanoseconds: {
    value: ofNanoseconds
  },
  ofNanos: {
    value: ofNanos
  },
  ofMicroseconds: {
    value: ofMicroseconds
  },
  ofMicros: {
    value: ofMicros
  },
  ofMilliseconds: {
    value: ofMilliseconds
  },
  ofMillis: {
    value: ofMillis
  },
  ofSeconds: {
    value: ofSeconds
  },
  ofMinutes: {
    value: ofMinutes
  },
  ofHours: {
    value: ofHours
  },
  ofDays: {
    value: ofDays
  },
  ofWeeks: {
    value: ofWeeks
  },
  ofMonths: {
    value: ofMonths
  },
  ofQuarters: {
    value: ofQuarters
  },
  ofYears: {
    value: ofYears
  },
  fromParts: {
    value: fromParts
  },
  from: {
    value: from
  }
})
ObjectDefineProperties(Period.prototype, {
  withNanos: {
    value: Period.prototype.withNanoseconds
  },
  withMicros: {
    value: Period.prototype.withMicroseconds
  },
  withMillis: {
    value: Period.prototype.withMilliseconds
  },
  addNanos: {
    value: Period.prototype.addNanoseconds
  },
  addMicros: {
    value: Period.prototype.addMicroseconds
  },
  addMillis: {
    value: Period.prototype.addMilliseconds
  },
  subtractNanos: {
    value: Period.prototype.subtractNanoseconds
  },
  subtractMicros: {
    value: Period.prototype.subtractMicroseconds
  },
  subtractMillis: {
    value: Period.prototype.subtractMilliseconds
  },
  [SymbolToStringTag]: {
    value: 'Period'
  }
})

module.exports = Period
