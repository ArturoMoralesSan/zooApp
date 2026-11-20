// utils/cards.ts formats dates in the device's time zone. Set here, before
// the test workers start, so they inherit it: assigned inside a worker
// (setupFiles) it comes too late for Intl.
module.exports = () => {
	process.env.TZ = 'America/Monterrey'
}
