Component({
    states: ['num'],
    methods: {
        onLoad: function() {
            setTimeout(() => {
                getApp().store.commit('num', 3)
                getApp().store.commit('text', 'commit')
            }, 2000)
        },
    }
})