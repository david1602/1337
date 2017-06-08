module.exports = {
    renderStats(stats) {
        return ['Todays stats:'].concat(
            Object.keys(stats)
            .map(key => stats[key])
            .map(obj => `${obj.first_name}: ${obj.counter}`)
        )
        .join('\n');
    }
}