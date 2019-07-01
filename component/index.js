//store的核心逻辑类
const storeCore = {

    stateMap: new Map(),
    pageMap: new Map(),
    partData: false,

    /**
     * 注册计数器
     * 
     * @retrun Number 新的计数器
     */
    getRegisterIndex: function() {
        this.registerIndex = (this.registerIndex || 0) + 1
        return this.registerIndex
    },

    /**
     * 提交数据改变
     * 
     * @param attr 要改变的属性名
     * @param value 新的属性值
     */
    commit: function(attr, value) {
        if (this.state[attr] == value) {
            return
        }
        this.state[attr] = value
        //全部显示
        if (!this.partData) {
            this.pageMap.forEach(context => {
                context.setData({
                    [`$State.${attr}`]: value
                })
            })
            return;
        }
        //部分显示，查找对应的context
        const indexArray = this.stateMap.get(attr)
        if (!indexArray || indexArray.length == 0) {
            return;
        }
        for (var index of indexArray) {
            const context = this.pageMap.get(index)
            if (!context) {
                continue
            }
            context.setData({
                [`$State.${attr}`]: value
            })
        }
    },

    /**
     * 在要使用的地方初始化State数据
     * 
     * @param config
     */
    initStateData(config) {
        if (!this.partData || !config || (!config.states && !this.states)) {
            return;
        }
        config.states = config.states ? config.states : []
        if (this.states && this.states.length > 0) {
            const dis = config.disableStates && config.disableStates.length > 0
            for (var value of this.states) {
                if (typeof value != 'string') {
                    continue
                }
                if (dis && config.disableStates.indexOf(value) != -1) {
                    continue
                }
                config.states.push(value)
            }
        }

    },

    /**
     * 注册状态
     * 
     * @param context 上下文环境
     * @param state 要监控的状态属性名列表
     */
    register: function(context, state) {
        if (!context || (this.partData && (!state || state.length == 0))) {
            return;
        }
        const index = this.getRegisterIndex();
        this.pageMap.set(index, context)
        if (!this.partData) {
            context.setData({
                $State: this.state
            })
            return index
        }
        //对部分属性进行注册
        let changeData;
        for (var attr of state) {
            let indexArray = this.stateMap.get(attr)
            if (!indexArray) {
                indexArray = []
                this.stateMap.set(attr, indexArray)
            }
            indexArray.push(index)
            if (this.state[attr] == undefined) {
                continue
            }
            if (!changeData) {
                changeData = {
                    $State: {}
                };
            }
            changeData.$State[attr] = this.state[attr]
        }
        if (changeData) {
            context.setData(changeData)
        }
        return index
    },
    /**
     * 注销状态
     * 
     * @param index 注册器的计数
     * @param state 注销的状态列表
     */
    unregister: function(index, state) {
        if (!index) {
            return
        }
        this.pageMap.get(index).$StoreIndex = undefined
        this.pageMap.delete(index)
        if (!state || state.length == 0) {
            return;
        }
        for (var attr of state) {
            const indexArray = this.stateMap.get(attr)
            const index = indexArray.indexOf(index)
            if (index == -1) {
                continue;
            }
            indexArray.splice(index, 1)
        }
    }
}


const originalApp = App;
App = function(config) {

    const {
        onLaunch
    } = config

    config.onLaunch = function(options) {
        this.store = Object.assign(storeCore, this.store || {})
        if (onLaunch && typeof onLaunch === 'function') {
            onLaunch.call(this, options)
        }
    }
    return originalApp(config)
}


//页面的注册与注销
const originalPage = Page
Page = function(config) {
    const {
        onLoad,
        onShow,
        onHide,
        onUnload,
    } = config;

    getApp().store.initStateData(config)

    config.onLoad = function(options) {
        if (!this.$StoreIndex && (!getApp().store.partData || (this.states && this.states.length != 0))) {
            this.$StoreIndex = getApp().store.register(this, this.states)
        }
        onLoad && typeof onLoad === 'function' && onLoad.call(this, options)
    }

    config.onShow = function() {
        if (!this.$StoreIndex && (!getApp().store.partData || (this.states && this.states.length != 0))) {
            this.$StoreIndex = getApp().store.register(this, this.states)
        }
        onShow && typeof onShow === 'function' && onShow.call(this)
    }

    config.onHide = function() {
        onHide && typeof onHide === 'function' && onHide.call(this)
        if (this.$StoreIndex) {
            getApp().store.unregister(this.$StoreIndex, this.states)
        }
    }

    return originalPage(config)
}


//组件的注册与注销
const originalComponent = Component
Component = function(config) {
    const lifetimes = config.lifetimes || config

    const {
        attached,
        detached
    } = lifetimes

    const pageLifetimes = config.pageLifetimes || {}

    const {
        show,
        hide
    } = pageLifetimes

    getApp().store.initStateData(config)

    lifetimes.attached = function() {
        if (!this.$StoreIndex && (!getApp().store.partData || (config.states && config.states.length != 0))) {
            this.$StoreIndex = getApp().store.register(this, config.states)
        }
        attached && typeof attached === 'function' && attached.call(this)
    }

    lifetimes.detached = function() {
        detached && typeof detached === 'function' && detached.call(this)
        if (this.$StoreIndex) {
            getApp().store.unregister(this.$StoreIndex, config.states)
        }
    }

    pageLifetimes.show = function() {
        if (!this.$StoreIndex && (!getApp().store.partData || (config.states && config.states.length != 0))) {
            this.$StoreIndex = getApp().store.register(this, config.states)
        }
        show && typeof show === 'function' && show.call(this)
    }

    pageLifetimes.hide = function() {
        hide && typeof hide === 'function' && hide.call(this)
        if (this.$StoreIndex) {
            getApp().store.unregister(this.$StoreIndex, config.states)
        }
    }

    return originalComponent(config)
}