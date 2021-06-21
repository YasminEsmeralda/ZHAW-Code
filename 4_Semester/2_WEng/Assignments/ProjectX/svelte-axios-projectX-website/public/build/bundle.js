
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.37.0 */

    const { Error: Error_1, Object: Object_1, console: console_1$8 } = globals;

    // (209:0) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.37.0 */

    const file$b = "src\\pages\\Home.svelte";

    function create_fragment$b(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Welcome to the Application Project X: Website";
    			t1 = space();
    			div = element("div");
    			img = element("img");
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$b, 0, 0, 0);
    			attr_dev(img, "class", "img-fluid logo svelte-qrpnmr");
    			attr_dev(img, "alt", "Svelte Logo");
    			if (img.src !== (img_src_value = "images/professionelle-webseite.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$b, 3, 4, 119);
    			attr_dev(div, "class", "my-5");
    			set_style(div, "text-align", "center");
    			add_location(div, file$b, 2, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    /* src\pages\pages\page.svelte generated by Svelte v3.37.0 */

    const { console: console_1$7 } = globals;
    const file$a = "src\\pages\\pages\\page.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (66:28) {#each page.provisions as provision}
    function create_each_block_1$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*provision*/ ctx[6].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let p;
    	let t2;
    	let t3_value = /*provision*/ ctx[6].dateFrom + "";
    	let t3;
    	let t4;
    	let t5_value = /*provision*/ ctx[6].dateTo + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			p = element("p");
    			t2 = text("from ");
    			t3 = text(t3_value);
    			t4 = text(" until ");
    			t5 = text(t5_value);
    			t6 = space();
    			add_location(td0, file$a, 67, 32, 2312);
    			add_location(p, file$a, 71, 36, 2483);
    			add_location(td1, file$a, 70, 32, 2441);
    			add_location(tr, file$a, 66, 28, 2274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(tr, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pages*/ 1 && t0_value !== (t0_value = /*provision*/ ctx[6].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*pages*/ 1 && t3_value !== (t3_value = /*provision*/ ctx[6].dateFrom + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*pages*/ 1 && t5_value !== (t5_value = /*provision*/ ctx[6].dateTo + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(66:28) {#each page.provisions as provision}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#each pages as page, pos}
    function create_each_block$7(ctx) {
    	let div3;
    	let h2;
    	let button0;
    	let strong0;
    	let t0_value = /*page*/ ctx[3].name + "";
    	let t0;
    	let button0_data_bs_target_value;
    	let button0_aria_controls_value;
    	let h2_id_value;
    	let t1;
    	let div2;
    	let div1;
    	let p0;
    	let strong1;
    	let t3_value = /*page*/ ctx[3].language + "";
    	let t3;
    	let t4;
    	let p1;
    	let strong2;
    	let t6;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t8;
    	let th1;
    	let t10;
    	let tbody;
    	let t11;
    	let div0;
    	let button1;
    	let div2_id_value;
    	let div2_aria_labelledby_value;
    	let t13;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*page*/ ctx[3].provisions;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h2 = element("h2");
    			button0 = element("button");
    			strong0 = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Language: ";
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "This Page provides the following Provisions";
    			t6 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t8 = space();
    			th1 = element("th");
    			th1.textContent = "Date";
    			t10 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			div0 = element("div");
    			button1 = element("button");
    			button1.textContent = "Delete Page";
    			t13 = space();
    			add_location(strong0, file$a, 50, 20, 1436);
    			attr_dev(button0, "class", "accordion-button collapsed");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-toggle", "collapse");
    			attr_dev(button0, "data-bs-target", button0_data_bs_target_value = "#flush-collapse" + /*page*/ ctx[3].id);
    			attr_dev(button0, "aria-expanded", "false");
    			attr_dev(button0, "aria-controls", button0_aria_controls_value = "flush-collapse" + /*page*/ ctx[3].id);
    			add_location(button0, file$a, 49, 16, 1227);
    			attr_dev(h2, "class", "accordion-header");
    			attr_dev(h2, "id", h2_id_value = "flush-heading" + /*page*/ ctx[3].id);
    			add_location(h2, file$a, 48, 12, 1152);
    			add_location(strong1, file$a, 55, 23, 1739);
    			add_location(p0, file$a, 55, 20, 1736);
    			add_location(strong2, file$a, 56, 23, 1810);
    			add_location(p1, file$a, 56, 20, 1807);
    			add_location(th0, file$a, 60, 32, 2018);
    			add_location(th1, file$a, 61, 32, 2063);
    			add_location(tr, file$a, 59, 28, 1980);
    			add_location(thead, file$a, 58, 24, 1943);
    			add_location(tbody, file$a, 64, 24, 2171);
    			attr_dev(table, "class", "table");
    			add_location(table, file$a, 57, 20, 1896);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-danger");
    			add_location(button1, file$a, 78, 24, 2822);
    			attr_dev(div0, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div0, file$a, 77, 20, 2737);
    			attr_dev(div1, "class", "accordion-body");
    			add_location(div1, file$a, 54, 16, 1686);
    			attr_dev(div2, "id", div2_id_value = "flush-collapse" + /*page*/ ctx[3].id);
    			attr_dev(div2, "class", "accordion-collapse collapse");
    			attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value = "flush-heading" + /*page*/ ctx[3].id);
    			attr_dev(div2, "data-bs-parent", "#accordingFlush");
    			add_location(div2, file$a, 53, 12, 1524);
    			attr_dev(div3, "class", "accordion-item");
    			add_location(div3, file$a, 47, 8, 1110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h2);
    			append_dev(h2, button0);
    			append_dev(button0, strong0);
    			append_dev(strong0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong1);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, strong2);
    			append_dev(div1, t6);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t8);
    			append_dev(tr, th1);
    			append_dev(table, t10);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div1, t11);
    			append_dev(div1, div0);
    			append_dev(div0, button1);
    			insert_dev(target, t13, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*deletePage*/ ctx[1](/*page*/ ctx[3].id, /*pos*/ ctx[5]))) /*deletePage*/ ctx[1](/*page*/ ctx[3].id, /*pos*/ ctx[5]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*pages*/ 1 && t0_value !== (t0_value = /*page*/ ctx[3].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*pages*/ 1 && button0_data_bs_target_value !== (button0_data_bs_target_value = "#flush-collapse" + /*page*/ ctx[3].id)) {
    				attr_dev(button0, "data-bs-target", button0_data_bs_target_value);
    			}

    			if (dirty & /*pages*/ 1 && button0_aria_controls_value !== (button0_aria_controls_value = "flush-collapse" + /*page*/ ctx[3].id)) {
    				attr_dev(button0, "aria-controls", button0_aria_controls_value);
    			}

    			if (dirty & /*pages*/ 1 && h2_id_value !== (h2_id_value = "flush-heading" + /*page*/ ctx[3].id)) {
    				attr_dev(h2, "id", h2_id_value);
    			}

    			if (dirty & /*pages*/ 1 && t3_value !== (t3_value = /*page*/ ctx[3].language + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*pages*/ 1) {
    				each_value_1 = /*page*/ ctx[3].provisions;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*pages*/ 1 && div2_id_value !== (div2_id_value = "flush-collapse" + /*page*/ ctx[3].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}

    			if (dirty & /*pages*/ 1 && div2_aria_labelledby_value !== (div2_aria_labelledby_value = "flush-heading" + /*page*/ ctx[3].id)) {
    				attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t13);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(47:8) {#each pages as page, pos}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let div1;
    	let each_value = /*pages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Pages";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Page";
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$a, 35, 4, 707);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$a, 39, 12, 856);
    			attr_dev(div0, "class", "d-grid gap-1");
    			add_location(div0, file$a, 38, 8, 816);
    			attr_dev(a, "href", "#/create-page");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$a, 37, 4, 751);
    			attr_dev(div1, "class", "accordion according-flush mb-1");
    			attr_dev(div1, "id", "accordingFlush");
    			add_location(div1, file$a, 45, 4, 1000);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$a, 34, 0, 678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, a);
    			append_dev(a, div0);
    			append_dev(div0, button);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pages, deletePage*/ 3) {
    				each_value = /*pages*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Page", slots, []);
    	let pages = [];

    	onMount(() => {
    		getPages();
    	});

    	function getPages() {
    		axios.get("http://localhost:8080/website/pages").then(response => {
    			$$invalidate(0, pages = response.data);
    		});
    	}

    	function deletePage(id, pos) {
    		axios.delete("http://localhost:8080/website/pages/" + id).then(response => {
    			alert("Page " + pages[pos].name + " deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		pages,
    		getPages,
    		deletePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("pages" in $$props) $$invalidate(0, pages = $$props.pages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pages, deletePage];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\pages\pages\CreatePage.svelte generated by Svelte v3.37.0 */

    const { console: console_1$6 } = globals;
    const file$9 = "src\\pages\\pages\\CreatePage.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (43:20) {#each languages as language}
    function create_each_block$6(ctx) {
    	let option;
    	let t_value = /*language*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*language*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file$9, 43, 20, 1315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(43:20) {#each languages as language}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div4;
    	let div3;
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let select;
    	let t7;
    	let div2;
    	let button0;
    	let t9;
    	let a;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*languages*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add a Page";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Language";
    			t6 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Page";
    			t9 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Pageoverview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$9, 28, 8, 719);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$9, 32, 16, 819);
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "type", "text");
    			add_location(input, file$9, 33, 16, 882);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$9, 31, 12, 783);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$9, 40, 16, 1120);
    			attr_dev(select, "class", "form-select");
    			if (/*page*/ ctx[0].language === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$9, 41, 16, 1187);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$9, 39, 12, 1084);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$9, 48, 16, 1527);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$9, 52, 20, 1706);
    			attr_dev(a, "href", "#/page");
    			add_location(a, file$9, 51, 16, 1667);
    			attr_dev(div2, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div2, file$9, 47, 12, 1450);
    			add_location(form, file$9, 30, 8, 763);
    			attr_dev(div3, "class", "mb-5");
    			add_location(div3, file$9, 27, 4, 691);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$9, 26, 0, 662);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t1);
    			append_dev(div3, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input);
    			set_input_value(input, /*page*/ ctx[0].name);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*page*/ ctx[0].language);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t9);
    			append_dev(div2, a);
    			append_dev(a, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4]),
    					listen_dev(button0, "click", /*addPage*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page, languages*/ 3 && input.value !== /*page*/ ctx[0].name) {
    				set_input_value(input, /*page*/ ctx[0].name);
    			}

    			if (dirty & /*languages*/ 2) {
    				each_value = /*languages*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*page, languages*/ 3) {
    				select_option(select, /*page*/ ctx[0].language);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreatePage", slots, []);
    	let page = { language: "", name: null };

    	let languages = [
    		"",
    		"Englisch",
    		"Französisch",
    		"Portugisisch",
    		"Spanisch",
    		"Russisch",
    		"Deutsch",
    		"Ungarisch",
    		"Italienisch",
    		"Dänisch",
    		"Bulgarisch"
    	];

    	function addPage() {
    		axios.post("http://localhost:8080/website/pages/", page).then(response => {
    			alert("Page " + page.name + " added");
    			$$invalidate(0, page.language = "", page);
    			$$invalidate(0, page.name = null, page);
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<CreatePage> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		page.name = this.value;
    		$$invalidate(0, page);
    		$$invalidate(1, languages);
    	}

    	function select_change_handler() {
    		page.language = select_value(this);
    		$$invalidate(0, page);
    		$$invalidate(1, languages);
    	}

    	$$self.$capture_state = () => ({ axios, page, languages, addPage });

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("languages" in $$props) $$invalidate(1, languages = $$props.languages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, languages, addPage, input_input_handler, select_change_handler];
    }

    class CreatePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePage",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\pages\provisions\provision.svelte generated by Svelte v3.37.0 */

    const { console: console_1$5 } = globals;
    const file$8 = "src\\pages\\provisions\\provision.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (83:12) {#each provisions as provision}
    function create_each_block$5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*provision*/ ctx[5].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let p;
    	let t2;
    	let t3_value = /*provision*/ ctx[5].dateFrom + "";
    	let t3;
    	let t4;
    	let t5_value = /*provision*/ ctx[5].dateTo + "";
    	let t5;
    	let t6;
    	let td2;
    	let div;
    	let button;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			p = element("p");
    			t2 = text("from ");
    			t3 = text(t3_value);
    			t4 = text(" until ");
    			t5 = text(t5_value);
    			t6 = space();
    			td2 = element("td");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			t8 = space();
    			add_location(td0, file$8, 84, 16, 1999);
    			add_location(p, file$8, 88, 20, 2106);
    			add_location(td1, file$8, 87, 16, 2080);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-outline-danger");
    			add_location(button, file$8, 92, 24, 2315);
    			attr_dev(div, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div, file$8, 91, 20, 2230);
    			add_location(td2, file$8, 90, 16, 2204);
    			add_location(tr, file$8, 83, 12, 1977);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td2);
    			append_dev(td2, div);
    			append_dev(div, button);
    			append_dev(tr, t8);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*deleteProvision*/ ctx[2](/*provision*/ ctx[5].id))) /*deleteProvision*/ ctx[2](/*provision*/ ctx[5].id).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*provisions*/ 1 && t0_value !== (t0_value = /*provision*/ ctx[5].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*provisions*/ 1 && t3_value !== (t3_value = /*provision*/ ctx[5].dateFrom + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*provisions*/ 1 && t5_value !== (t5_value = /*provision*/ ctx[5].dateTo + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(83:12) {#each provisions as provision}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t8;
    	let tbody;
    	let mounted;
    	let dispose;
    	let each_value = /*provisions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all Provisions";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Provision";
    			t3 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Date";
    			t7 = space();
    			th2 = element("th");
    			t8 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$8, 63, 4, 1401);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$8, 67, 12, 1550);
    			attr_dev(div0, "class", "d-grid gap-2");
    			add_location(div0, file$8, 66, 8, 1510);
    			attr_dev(a, "href", "#/create-provision");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$8, 65, 4, 1440);
    			add_location(th0, file$8, 76, 16, 1773);
    			add_location(th1, file$8, 77, 16, 1824);
    			add_location(th2, file$8, 78, 16, 1855);
    			add_location(tr, file$8, 75, 12, 1751);
    			add_location(thead, file$8, 74, 8, 1730);
    			add_location(tbody, file$8, 81, 8, 1911);
    			attr_dev(table, "class", "table");
    			add_location(table, file$8, 73, 4, 1699);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$8, 62, 0, 1372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(div0, button);
    			append_dev(div1, t3);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(table, t8);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(
    					th0,
    					"click",
    					function () {
    						if (is_function(/*sort*/ ctx[1]("id"))) /*sort*/ ctx[1]("id").apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*deleteProvision, provisions*/ 5) {
    				each_value = /*provisions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let sort;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Provision", slots, []);
    	let provisions = [];

    	onMount(() => {
    		getProvisions();
    	});

    	function getProvisions() {
    		axios.get("http://localhost:8080/website/provisions").then(response => {
    			$$invalidate(0, provisions = response.data);
    		});
    	}

    	function deleteProvision(id) {
    		axios.delete("http://localhost:8080/website/provisions/" + id).then(response => {
    			alert("Provision " + id + " deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	// Holds table sort state.  Initialized to reflect table sorted by id column ascending.
    	let sortBy = { col: "id", ascending: true };

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Provision> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		provisions,
    		getProvisions,
    		deleteProvision,
    		sortBy,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("provisions" in $$props) $$invalidate(0, provisions = $$props.provisions);
    		if ("sortBy" in $$props) $$invalidate(3, sortBy = $$props.sortBy);
    		if ("sort" in $$props) $$invalidate(1, sort = $$props.sort);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sortBy, provisions*/ 9) {
    			$$invalidate(1, sort = column => {
    				if (sortBy.col == column) {
    					$$invalidate(3, sortBy.ascending = !sortBy.ascending, sortBy);
    				} else {
    					$$invalidate(3, sortBy.col = column, sortBy);
    					$$invalidate(3, sortBy.ascending = true, sortBy);
    				}

    				// Modifier to sorting function for ascending or descending
    				let sortModifier = sortBy.ascending ? 1 : -1;

    				let sort = (a, b) => a[column] < b[column]
    				? -1 * sortModifier
    				: a[column] > b[column] ? 1 * sortModifier : 0;

    				$$invalidate(0, provisions = provisions.sort(sort));
    			});
    		}
    	};

    	return [provisions, sort, deleteProvision, sortBy];
    }

    class Provision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Provision",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\provisions\createProvision.svelte generated by Svelte v3.37.0 */

    const { console: console_1$4 } = globals;
    const file$7 = "src\\pages\\provisions\\createProvision.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (94:16) {#each pages as id}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*id*/ ctx[10] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*id*/ ctx[10];
    			option.value = option.__value;
    			add_location(option, file$7, 94, 16, 2595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pages*/ 2 && t_value !== (t_value = /*id*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*pages*/ 2 && option_value_value !== (option_value_value = /*id*/ ctx[10])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(94:16) {#each pages as id}",
    		ctx
    	});

    	return block;
    }

    // (102:16) {#each navigations as id}
    function create_each_block$4(ctx) {
    	let option;
    	let t_value = /*id*/ ctx[10] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*id*/ ctx[10];
    			option.value = option.__value;
    			add_location(option, file$7, 102, 16, 2940);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navigations*/ 4 && t_value !== (t_value = /*id*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*navigations*/ 4 && option_value_value !== (option_value_value = /*id*/ ctx[10])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(102:16) {#each navigations as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div5;
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let select0;
    	let t10;
    	let div3;
    	let label3;
    	let t12;
    	let select1;
    	let t13;
    	let div4;
    	let button0;
    	let t15;
    	let a;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*pages*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*navigations*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add an Provision";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Date From";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Date To";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Page";
    			t9 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Navigation Layout";
    			t12 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Provision";
    			t15 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Provisionverview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$7, 71, 4, 1764);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$7, 75, 12, 1858);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "date");
    			add_location(input0, file$7, 76, 12, 1922);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$7, 74, 8, 1826);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$7, 83, 12, 2142);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "date");
    			add_location(input1, file$7, 84, 12, 2204);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$7, 82, 8, 2110);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$7, 91, 12, 2422);
    			attr_dev(select0, "class", "form-select");
    			if (/*provision*/ ctx[0].page_id === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[6].call(select0));
    			add_location(select0, file$7, 92, 12, 2481);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$7, 90, 8, 2390);
    			attr_dev(label3, "for", "");
    			attr_dev(label3, "class", "form-label");
    			add_location(label3, file$7, 99, 12, 2742);
    			attr_dev(select1, "class", "form-select");
    			if (/*provision*/ ctx[0].navigation_id === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file$7, 100, 12, 2814);
    			attr_dev(div3, "class", "mb-3");
    			add_location(div3, file$7, 98, 8, 2710);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$7, 107, 12, 3128);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$7, 111, 16, 3306);
    			attr_dev(a, "href", "#/provision");
    			add_location(a, file$7, 110, 12, 3266);
    			attr_dev(div4, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div4, file$7, 106, 8, 3055);
    			add_location(form, file$7, 73, 4, 1810);
    			attr_dev(div5, "class", "mb-5");
    			add_location(div5, file$7, 70, 0, 1740);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h1);
    			append_dev(div5, t1);
    			append_dev(div5, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*provision*/ ctx[0].dateFrom);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*provision*/ ctx[0].dateTo);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*provision*/ ctx[0].page_id);
    			append_dev(form, t10);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t12);
    			append_dev(div3, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*provision*/ ctx[0].navigation_id);
    			append_dev(form, t13);
    			append_dev(form, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t15);
    			append_dev(div4, a);
    			append_dev(a, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[6]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[7]),
    					listen_dev(button0, "click", /*addProvision*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*provision, pages*/ 3) {
    				set_input_value(input0, /*provision*/ ctx[0].dateFrom);
    			}

    			if (dirty & /*provision, pages*/ 3) {
    				set_input_value(input1, /*provision*/ ctx[0].dateTo);
    			}

    			if (dirty & /*pages*/ 2) {
    				each_value_1 = /*pages*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*provision, pages*/ 3) {
    				select_option(select0, /*provision*/ ctx[0].page_id);
    			}

    			if (dirty & /*navigations*/ 4) {
    				each_value = /*navigations*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*provision, pages*/ 3) {
    				select_option(select1, /*provision*/ ctx[0].navigation_id);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreateProvision", slots, []);

    	let provision = {
    		dateFrom: null,
    		dateTo: null,
    		page_id: null,
    		navigation_id: null
    	};

    	let pages = [];
    	let navigations = [];

    	onMount(() => {
    		getPages();
    		getNavigations();
    	});

    	function getPages() {
    		axios.get("http://localhost:8080/website/pages").then(response => {
    			$$invalidate(1, pages = []);

    			for (let page of response.data) {
    				pages.push(page.id + " - " + page.name);
    			}

    			$$invalidate(0, provision.page_id = pages[0], provision);
    		});
    	}

    	function getNavigations() {
    		axios.get("http://localhost:8080/website/navigations").then(response => {
    			$$invalidate(2, navigations = []);

    			for (let navigation of response.data) {
    				navigations.push(navigation.id + " - " + navigation.layout);
    			}

    			$$invalidate(0, provision.navigation_id = navigations[0], provision);
    		});
    	}

    	function addProvision() {
    		let pageComponents = provision.page_id.split("-");
    		let navigationComponents = provision.navigation_id.split("-");
    		$$invalidate(0, provision.page_id = pageComponents[0], provision);
    		$$invalidate(0, provision.navigation_id = navigationComponents[0], provision);

    		axios.post("http://localhost:8080/website/provisions", provision).then(response => {
    			alert("Provision added");
    			$$invalidate(0, provision.dateFrom = null, provision);
    			$$invalidate(0, provision.dateTo = null, provision);
    			$$invalidate(0, provision.page_id = null, provision);
    			$$invalidate(0, provision.navigation_id = null, provision);
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<CreateProvision> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		provision.dateFrom = this.value;
    		$$invalidate(0, provision);
    		$$invalidate(1, pages);
    	}

    	function input1_input_handler() {
    		provision.dateTo = this.value;
    		$$invalidate(0, provision);
    		$$invalidate(1, pages);
    	}

    	function select0_change_handler() {
    		provision.page_id = select_value(this);
    		$$invalidate(0, provision);
    		$$invalidate(1, pages);
    	}

    	function select1_change_handler() {
    		provision.navigation_id = select_value(this);
    		$$invalidate(0, provision);
    		$$invalidate(1, pages);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		provision,
    		pages,
    		navigations,
    		getPages,
    		getNavigations,
    		addProvision
    	});

    	$$self.$inject_state = $$props => {
    		if ("provision" in $$props) $$invalidate(0, provision = $$props.provision);
    		if ("pages" in $$props) $$invalidate(1, pages = $$props.pages);
    		if ("navigations" in $$props) $$invalidate(2, navigations = $$props.navigations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		provision,
    		pages,
    		navigations,
    		addProvision,
    		input0_input_handler,
    		input1_input_handler,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class CreateProvision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateProvision",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\navigations\navigation.svelte generated by Svelte v3.37.0 */

    const file$6 = "src\\pages\\navigations\\navigation.svelte";

    function create_fragment$6(ctx) {
    	let div12;
    	let div11;
    	let h1;
    	let t1;
    	let div10;
    	let div4;
    	let a0;
    	let div0;
    	let button0;
    	let t3;
    	let div3;
    	let div2;
    	let h50;
    	let t5;
    	let p0;
    	let t6;
    	let br0;
    	let t7;
    	let br1;
    	let t8;
    	let t9;
    	let a1;
    	let div1;
    	let button1;
    	let t10;
    	let strong0;
    	let t12;
    	let t13;
    	let div9;
    	let a2;
    	let div5;
    	let button2;
    	let t15;
    	let div8;
    	let div7;
    	let h51;
    	let t17;
    	let p1;
    	let t18;
    	let br2;
    	let t19;
    	let br3;
    	let t20;
    	let t21;
    	let a3;
    	let div6;
    	let button3;
    	let t22;
    	let strong1;
    	let t24;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div11 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Choose Navigation Type";
    			t1 = space();
    			div10 = element("div");
    			div4 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "+ Add Navigation: Menu";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Menu";
    			t5 = space();
    			p0 = element("p");
    			t6 = text("In the Page Menus you will find an overview with submenus and the participating items.\r\n                            ");
    			br0 = element("br");
    			t7 = space();
    			br1 = element("br");
    			t8 = text("\r\n                            Menu has the attribut label to check for the name of the current menu.");
    			t9 = space();
    			a1 = element("a");
    			div1 = element("div");
    			button1 = element("button");
    			t10 = text("click here to go the ");
    			strong0 = element("strong");
    			strong0.textContent = "menu";
    			t12 = text(" list");
    			t13 = space();
    			div9 = element("div");
    			a2 = element("a");
    			div5 = element("div");
    			button2 = element("button");
    			button2.textContent = "+ Add navigation: Item";
    			t15 = space();
    			div8 = element("div");
    			div7 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Item";
    			t17 = space();
    			p1 = element("p");
    			t18 = text("In the Page Item you will find an overview with items and the participating menus.\r\n                            ");
    			br2 = element("br");
    			t19 = space();
    			br3 = element("br");
    			t20 = text("\r\n                            Item has the attribut views which shows you the amount of page views.");
    			t21 = space();
    			a3 = element("a");
    			div6 = element("div");
    			button3 = element("button");
    			t22 = text("click here to go the ");
    			strong1 = element("strong");
    			strong1.textContent = "item";
    			t24 = text(" list");
    			attr_dev(h1, "class", "mb-3");
    			add_location(h1, file$6, 2, 8, 57);
    			attr_dev(button0, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$6, 8, 24, 313);
    			attr_dev(div0, "class", "d-grid gap-2");
    			add_location(div0, file$6, 7, 20, 261);
    			attr_dev(a0, "href", "#/create-menu");
    			set_style(a0, "text-decoration", "none");
    			add_location(a0, file$6, 6, 16, 184);
    			attr_dev(h50, "class", "card-title");
    			add_location(h50, file$6, 15, 24, 616);
    			add_location(br0, file$6, 18, 28, 841);
    			add_location(br1, file$6, 19, 28, 877);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$6, 16, 24, 674);
    			add_location(strong0, file$6, 25, 57, 1298);
    			attr_dev(button1, "class", "btn btn-warning mb-3");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$6, 24, 32, 1188);
    			attr_dev(div1, "class", "d-grid gap-2");
    			add_location(div1, file$6, 23, 28, 1128);
    			attr_dev(a1, "href", "#/navigation/menu");
    			set_style(a1, "text-decoration", "none");
    			add_location(a1, file$6, 22, 24, 1039);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$6, 14, 20, 567);
    			attr_dev(div3, "class", "card");
    			add_location(div3, file$6, 13, 16, 527);
    			attr_dev(div4, "class", "col-sm-6");
    			add_location(div4, file$6, 5, 12, 144);
    			attr_dev(button2, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$6, 35, 24, 1781);
    			attr_dev(div5, "class", "d-grid gap-2");
    			add_location(div5, file$6, 34, 20, 1729);
    			attr_dev(a2, "href", "#/create-item");
    			set_style(a2, "text-decoration", "none");
    			add_location(a2, file$6, 33, 16, 1652);
    			attr_dev(h51, "class", "card-title");
    			add_location(h51, file$6, 42, 24, 2084);
    			add_location(br2, file$6, 45, 28, 2305);
    			add_location(br3, file$6, 46, 28, 2341);
    			attr_dev(p1, "class", "card-text");
    			add_location(p1, file$6, 43, 24, 2142);
    			add_location(strong1, file$6, 52, 57, 2761);
    			attr_dev(button3, "class", "btn btn-warning mb-3");
    			attr_dev(button3, "type", "button");
    			add_location(button3, file$6, 51, 32, 2651);
    			attr_dev(div6, "class", "d-grid gap-2");
    			add_location(div6, file$6, 50, 28, 2591);
    			attr_dev(a3, "href", "#/navigation/item");
    			set_style(a3, "text-decoration", "none");
    			add_location(a3, file$6, 49, 24, 2502);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$6, 41, 20, 2035);
    			attr_dev(div8, "class", "card");
    			add_location(div8, file$6, 40, 16, 1995);
    			attr_dev(div9, "class", "col-sm-6");
    			add_location(div9, file$6, 32, 12, 1612);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$6, 4, 8, 113);
    			attr_dev(div11, "class", "mb-5");
    			add_location(div11, file$6, 1, 4, 29);
    			attr_dev(div12, "class", "container");
    			add_location(div12, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			append_dev(div11, h1);
    			append_dev(div11, t1);
    			append_dev(div11, div10);
    			append_dev(div10, div4);
    			append_dev(div4, a0);
    			append_dev(a0, div0);
    			append_dev(div0, button0);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h50);
    			append_dev(div2, t5);
    			append_dev(div2, p0);
    			append_dev(p0, t6);
    			append_dev(p0, br0);
    			append_dev(p0, t7);
    			append_dev(p0, br1);
    			append_dev(p0, t8);
    			append_dev(div2, t9);
    			append_dev(div2, a1);
    			append_dev(a1, div1);
    			append_dev(div1, button1);
    			append_dev(button1, t10);
    			append_dev(button1, strong0);
    			append_dev(button1, t12);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div9, a2);
    			append_dev(a2, div5);
    			append_dev(div5, button2);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h51);
    			append_dev(div7, t17);
    			append_dev(div7, p1);
    			append_dev(p1, t18);
    			append_dev(p1, br2);
    			append_dev(p1, t19);
    			append_dev(p1, br3);
    			append_dev(p1, t20);
    			append_dev(div7, t21);
    			append_dev(div7, a3);
    			append_dev(a3, div6);
    			append_dev(div6, button3);
    			append_dev(button3, t22);
    			append_dev(button3, strong1);
    			append_dev(button3, t24);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\reusable\backButton.svelte generated by Svelte v3.37.0 */

    const file$5 = "src\\pages\\reusable\\backButton.svelte";

    function create_fragment$5(ctx) {
    	let a;
    	let div;
    	let button;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Go back to Navigation selection Type";
    			attr_dev(button, "class", "btn btn-outline-success mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$5, 2, 8, 96);
    			attr_dev(div, "class", "d-grid gap-1");
    			add_location(div, file$5, 1, 4, 60);
    			attr_dev(a, "href", "#/navigation");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackButton> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class BackButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackButton",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\navigations\menus\menu.svelte generated by Svelte v3.37.0 */

    const { console: console_1$3 } = globals;
    const file$4 = "src\\pages\\navigations\\menus\\menu.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (80:32) {:else}
    function create_else_block(ctx) {
    	let td0;
    	let t1;
    	let td1;
    	let t3;
    	let td2;
    	let t4_value = /*navigation*/ ctx[6].ctrViews + "";
    	let t4;

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			td0.textContent = "Item";
    			t1 = space();
    			td1 = element("td");
    			td1.textContent = "-";
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file$4, 80, 32, 2897);
    			add_location(td1, file$4, 81, 32, 2944);
    			add_location(td2, file$4, 82, 32, 2988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, td1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, td2, anchor);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus*/ 1 && t4_value !== (t4_value = /*navigation*/ ctx[6].ctrViews + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(td1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(td2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(80:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:32) {#if navigation.label != null}
    function create_if_block(ctx) {
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*navigation*/ ctx[6].label + "";
    	let t2;
    	let t3;
    	let td2;

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			td0.textContent = "Menu";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			td2.textContent = "-";
    			add_location(td0, file$4, 76, 32, 2704);
    			add_location(td1, file$4, 77, 32, 2751);
    			add_location(td2, file$4, 78, 32, 2812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, td1, anchor);
    			append_dev(td1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, td2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus*/ 1 && t2_value !== (t2_value = /*navigation*/ ctx[6].label + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(td1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(td2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(76:32) {#if navigation.label != null}",
    		ctx
    	});

    	return block;
    }

    // (71:28) {#each menu.navigations as navigation}
    function create_each_block_1(ctx) {
    	let tr;
    	let td;
    	let t0_value = /*navigation*/ ctx[6].id + "";
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*navigation*/ ctx[6].label != null) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			add_location(td, file$4, 72, 32, 2510);
    			add_location(tr, file$4, 71, 28, 2472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, t0);
    			append_dev(tr, t1);
    			if_block.m(tr, null);
    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus*/ 1 && t0_value !== (t0_value = /*navigation*/ ctx[6].id + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(tr, t2);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(71:28) {#each menu.navigations as navigation}",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#each menus as menu, pos}
    function create_each_block$3(ctx) {
    	let div3;
    	let h2;
    	let button0;
    	let strong0;
    	let t0;
    	let t1_value = /*menu*/ ctx[3].label + "";
    	let t1;
    	let button0_data_bs_target_value;
    	let button0_aria_controls_value;
    	let h2_id_value;
    	let t2;
    	let div2;
    	let div1;
    	let p0;
    	let strong1;
    	let t4_value = /*menu*/ ctx[3].layout + "";
    	let t4;
    	let t5;
    	let p1;
    	let strong2;
    	let t7;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t9;
    	let th1;
    	let t11;
    	let th2;
    	let t13;
    	let th3;
    	let t15;
    	let tbody;
    	let t16;
    	let div0;
    	let button1;
    	let div2_id_value;
    	let div2_aria_labelledby_value;
    	let t18;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*menu*/ ctx[3].navigations;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h2 = element("h2");
    			button0 = element("button");
    			strong0 = element("strong");
    			t0 = text("Label: ");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "layout: ";
    			t4 = text(t4_value);
    			t5 = space();
    			p1 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "This menu contains the following menus and items";
    			t7 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t9 = space();
    			th1 = element("th");
    			th1.textContent = "Navigation";
    			t11 = space();
    			th2 = element("th");
    			th2.textContent = "Label";
    			t13 = space();
    			th3 = element("th");
    			th3.textContent = "Views";
    			t15 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			div0 = element("div");
    			button1 = element("button");
    			button1.textContent = "Delete Page";
    			t18 = space();
    			add_location(strong0, file$4, 53, 20, 1501);
    			attr_dev(button0, "class", "accordion-button collapsed");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-toggle", "collapse");
    			attr_dev(button0, "data-bs-target", button0_data_bs_target_value = "#collapse" + /*menu*/ ctx[3].id);
    			attr_dev(button0, "aria-expanded", "true");
    			attr_dev(button0, "aria-controls", button0_aria_controls_value = "collapse" + /*menu*/ ctx[3].id);
    			add_location(button0, file$4, 52, 16, 1305);
    			attr_dev(h2, "class", "accordion-header");
    			attr_dev(h2, "id", h2_id_value = "flush-heading" + /*menu*/ ctx[3].id);
    			add_location(h2, file$4, 51, 12, 1230);
    			add_location(strong1, file$4, 58, 23, 1832);
    			add_location(p0, file$4, 58, 20, 1829);
    			add_location(strong2, file$4, 59, 23, 1899);
    			add_location(p1, file$4, 59, 20, 1896);
    			add_location(th0, file$4, 63, 32, 2112);
    			add_location(th1, file$4, 64, 32, 2157);
    			add_location(th2, file$4, 65, 32, 2210);
    			add_location(th3, file$4, 66, 32, 2258);
    			add_location(tr, file$4, 62, 28, 2074);
    			add_location(thead, file$4, 61, 24, 2037);
    			add_location(tbody, file$4, 69, 24, 2367);
    			attr_dev(table, "class", "table");
    			add_location(table, file$4, 60, 20, 1990);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-danger");
    			add_location(button1, file$4, 89, 24, 3300);
    			attr_dev(div0, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div0, file$4, 88, 20, 3215);
    			attr_dev(div1, "class", "accordion-body");
    			add_location(div1, file$4, 57, 16, 1779);
    			attr_dev(div2, "id", div2_id_value = "collapse" + /*menu*/ ctx[3].id);
    			attr_dev(div2, "class", "accordion-collapse collapse");
    			attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value = "flush-heading" + /*menu*/ ctx[3].id);
    			attr_dev(div2, "data-bs-parent", "#according");
    			add_location(div2, file$4, 56, 12, 1628);
    			attr_dev(div3, "class", "accordion-item");
    			add_location(div3, file$4, 50, 8, 1188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h2);
    			append_dev(h2, button0);
    			append_dev(button0, strong0);
    			append_dev(strong0, t0);
    			append_dev(strong0, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong1);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong2);
    			append_dev(div1, t7);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t9);
    			append_dev(tr, th1);
    			append_dev(tr, t11);
    			append_dev(tr, th2);
    			append_dev(tr, t13);
    			append_dev(tr, th3);
    			append_dev(table, t15);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div1, t16);
    			append_dev(div1, div0);
    			append_dev(div0, button1);
    			insert_dev(target, t18, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*deleteMenu*/ ctx[1](/*menu*/ ctx[3].id, /*pos*/ ctx[5]))) /*deleteMenu*/ ctx[1](/*menu*/ ctx[3].id, /*pos*/ ctx[5]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*menus*/ 1 && t1_value !== (t1_value = /*menu*/ ctx[3].label + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*menus*/ 1 && button0_data_bs_target_value !== (button0_data_bs_target_value = "#collapse" + /*menu*/ ctx[3].id)) {
    				attr_dev(button0, "data-bs-target", button0_data_bs_target_value);
    			}

    			if (dirty & /*menus*/ 1 && button0_aria_controls_value !== (button0_aria_controls_value = "collapse" + /*menu*/ ctx[3].id)) {
    				attr_dev(button0, "aria-controls", button0_aria_controls_value);
    			}

    			if (dirty & /*menus*/ 1 && h2_id_value !== (h2_id_value = "flush-heading" + /*menu*/ ctx[3].id)) {
    				attr_dev(h2, "id", h2_id_value);
    			}

    			if (dirty & /*menus*/ 1 && t4_value !== (t4_value = /*menu*/ ctx[3].layout + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*menus*/ 1) {
    				each_value_1 = /*menu*/ ctx[3].navigations;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*menus*/ 1 && div2_id_value !== (div2_id_value = "collapse" + /*menu*/ ctx[3].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}

    			if (dirty & /*menus*/ 1 && div2_aria_labelledby_value !== (div2_aria_labelledby_value = "flush-heading" + /*menu*/ ctx[3].id)) {
    				attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t18);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(50:8) {#each menus as menu, pos}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let backbutton;
    	let t4;
    	let div1;
    	let current;
    	backbutton = new BackButton({ $$inline: true });
    	let each_value = /*menus*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Menus";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Menu";
    			t3 = space();
    			create_component(backbutton.$$.fragment);
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$4, 36, 4, 768);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$4, 40, 12, 917);
    			attr_dev(div0, "class", "d-grid gap-1");
    			add_location(div0, file$4, 39, 8, 877);
    			attr_dev(a, "href", "#/create-menu");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$4, 38, 4, 812);
    			attr_dev(div1, "class", "accordion according-flush mb-1");
    			attr_dev(div1, "id", "according");
    			add_location(div1, file$4, 48, 4, 1083);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$4, 35, 0, 739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, a);
    			append_dev(a, div0);
    			append_dev(div0, button);
    			append_dev(div2, t3);
    			mount_component(backbutton, div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*menus, deleteMenu*/ 3) {
    				each_value = /*menus*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(backbutton);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	let menus = [];

    	onMount(() => {
    		getMenus();
    	});

    	function getMenus() {
    		axios.get("http://localhost:8080/website/menus").then(response => {
    			$$invalidate(0, menus = response.data);
    		});
    	}

    	function deleteMenu(id, pos) {
    		axios.delete("http://localhost:8080/website/menus/" + id).then(response => {
    			alert("Menu " + menus[pos].label + " deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		BackButton,
    		menus,
    		getMenus,
    		deleteMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("menus" in $$props) $$invalidate(0, menus = $$props.menus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menus, deleteMenu];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\navigations\menus\createMenu.svelte generated by Svelte v3.37.0 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\pages\\navigations\\menus\\createMenu.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (75:20) {#each menus as id}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*id*/ ctx[7] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*id*/ ctx[7];
    			option.value = option.__value;
    			add_location(option, file$3, 75, 20, 2004);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus*/ 2 && t_value !== (t_value = /*id*/ ctx[7] + "")) set_data_dev(t, t_value);

    			if (dirty & /*menus*/ 2 && option_value_value !== (option_value_value = /*id*/ ctx[7])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(75:20) {#each menus as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div5;
    	let div4;
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let select;
    	let t10;
    	let div3;
    	let button0;
    	let t12;
    	let a;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*menus*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add an Menu";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Layout";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Label";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Menu auswählen";
    			t9 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Item";
    			t12 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Item overview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$3, 52, 8, 1105);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$3, 56, 16, 1206);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$3, 57, 16, 1271);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$3, 55, 12, 1170);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$3, 64, 16, 1511);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$3, 65, 16, 1575);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$3, 63, 12, 1475);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$3, 72, 16, 1814);
    			attr_dev(select, "class", "form-select");
    			if (/*menu*/ ctx[0].menu_id === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$3, 73, 16, 1887);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$3, 71, 12, 1778);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$3, 80, 16, 2211);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$3, 84, 20, 2396);
    			attr_dev(a, "href", "#/navigation");
    			add_location(a, file$3, 83, 16, 2351);
    			attr_dev(div3, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div3, file$3, 79, 12, 2134);
    			add_location(form, file$3, 54, 8, 1150);
    			attr_dev(div4, "class", "mb-5");
    			add_location(div4, file$3, 51, 4, 1077);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$3, 50, 0, 1048);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, h1);
    			append_dev(div4, t1);
    			append_dev(div4, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*menu*/ ctx[0].layout);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*menu*/ ctx[0].label);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*menu*/ ctx[0].menu_id);
    			append_dev(form, t10);
    			append_dev(form, div3);
    			append_dev(div3, button0);
    			append_dev(div3, t12);
    			append_dev(div3, a);
    			append_dev(a, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*addMenu*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*menu, menus*/ 3 && input0.value !== /*menu*/ ctx[0].layout) {
    				set_input_value(input0, /*menu*/ ctx[0].layout);
    			}

    			if (dirty & /*menu, menus*/ 3 && input1.value !== /*menu*/ ctx[0].label) {
    				set_input_value(input1, /*menu*/ ctx[0].label);
    			}

    			if (dirty & /*menus*/ 2) {
    				each_value = /*menus*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*menu, menus*/ 3) {
    				select_option(select, /*menu*/ ctx[0].menu_id);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreateMenu", slots, []);
    	let menu = { layout: "", label: "", menu_id: -1 };
    	let menus = [];

    	onMount(() => {
    		getMenus();
    	});

    	function getMenus() {
    		axios.get("http://localhost:8080/website/menus").then(response => {
    			$$invalidate(1, menus = []);

    			for (let menu of response.data) {
    				menus.push(menu.id + " - " + menu.label);
    			}

    			$$invalidate(0, menu.menu_id = menus[0], menu);
    		});
    	}

    	function addMenu() {
    		let menuComponents = menu.menu_id.split("-");

    		axios.post("http://localhost:8080/website/menus/" + menuComponents[0], menu).then(response => {
    			alert("Menu: " + menu.layout + " added");
    			$$invalidate(0, menu.layout = "", menu);
    			$$invalidate(0, menu.label = "", menu);
    			$$invalidate(0, menu.menu_id = -1, menu);
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CreateMenu> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		menu.layout = this.value;
    		$$invalidate(0, menu);
    		$$invalidate(1, menus);
    	}

    	function input1_input_handler() {
    		menu.label = this.value;
    		$$invalidate(0, menu);
    		$$invalidate(1, menus);
    	}

    	function select_change_handler() {
    		menu.menu_id = select_value(this);
    		$$invalidate(0, menu);
    		$$invalidate(1, menus);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		menu,
    		menus,
    		getMenus,
    		addMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("menu" in $$props) $$invalidate(0, menu = $$props.menu);
    		if ("menus" in $$props) $$invalidate(1, menus = $$props.menus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		menu,
    		menus,
    		addMenu,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class CreateMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateMenu",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\navigations\items\item.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\pages\\navigations\\items\\item.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (59:12) {#each items as item, pos}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*item*/ ctx[3].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*item*/ ctx[3].layout + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*item*/ ctx[3].ctrViews + "";
    	let t4;
    	let t5;
    	let td3;
    	let div;
    	let button;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			t7 = space();
    			add_location(td0, file$2, 60, 16, 1415);
    			add_location(td1, file$2, 63, 16, 1491);
    			add_location(td2, file$2, 66, 16, 1571);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-outline-danger");
    			add_location(button, file$2, 71, 24, 1764);
    			attr_dev(div, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div, file$2, 70, 20, 1679);
    			add_location(td3, file$2, 69, 16, 1653);
    			add_location(tr, file$2, 59, 12, 1393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, div);
    			append_dev(div, button);
    			append_dev(tr, t7);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*deleteItems*/ ctx[1](/*item*/ ctx[3].id, /*pos*/ ctx[5]))) /*deleteItems*/ ctx[1](/*item*/ ctx[3].id, /*pos*/ ctx[5]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*items*/ 1 && t2_value !== (t2_value = /*item*/ ctx[3].layout + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*items*/ 1 && t4_value !== (t4_value = /*item*/ ctx[3].ctrViews + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(59:12) {#each items as item, pos}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let backbutton;
    	let t4;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t6;
    	let th1;
    	let t8;
    	let th2;
    	let t10;
    	let th3;
    	let t11;
    	let tbody;
    	let current;
    	backbutton = new BackButton({ $$inline: true });
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Items";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Item";
    			t3 = space();
    			create_component(backbutton.$$.fragment);
    			t4 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t6 = space();
    			th1 = element("th");
    			th1.textContent = "Layout";
    			t8 = space();
    			th2 = element("th");
    			th2.textContent = "Views";
    			t10 = space();
    			th3 = element("th");
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 36, 4, 793);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$2, 40, 12, 942);
    			attr_dev(div0, "class", "d-grid gap-1");
    			add_location(div0, file$2, 39, 8, 902);
    			attr_dev(a, "href", "#/create-item");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$2, 38, 4, 837);
    			add_location(th0, file$2, 51, 16, 1182);
    			add_location(th1, file$2, 52, 16, 1211);
    			add_location(th2, file$2, 53, 16, 1244);
    			add_location(th3, file$2, 54, 16, 1276);
    			add_location(tr, file$2, 50, 12, 1160);
    			add_location(thead, file$2, 49, 8, 1139);
    			add_location(tbody, file$2, 57, 8, 1332);
    			attr_dev(table, "class", "table");
    			add_location(table, file$2, 48, 4, 1108);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$2, 35, 0, 764);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(div0, button);
    			append_dev(div1, t3);
    			mount_component(backbutton, div1, null);
    			append_dev(div1, t4);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t6);
    			append_dev(tr, th1);
    			append_dev(tr, t8);
    			append_dev(tr, th2);
    			append_dev(tr, t10);
    			append_dev(tr, th3);
    			append_dev(table, t11);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteItems, items*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(backbutton);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let items = [];

    	onMount(() => {
    		getItems();
    	});

    	function getItems() {
    		axios.get("http://localhost:8080/website/items").then(response => {
    			$$invalidate(0, items = response.data);
    		});
    	}

    	function deleteItems(id, pos) {
    		axios.delete("http://localhost:8080/website/items/" + id).then(response => {
    			alert("Item " + items[pos].id + ": " + items[pos].layout + " deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		BackButton,
    		items,
    		getItems,
    		deleteItems
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, deleteItems];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\navigations\items\createItem.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\navigations\\items\\createItem.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (75:20) {#each menus as id}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*id*/ ctx[7] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*id*/ ctx[7];
    			option.value = option.__value;
    			add_location(option, file$1, 75, 20, 2019);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus*/ 2 && t_value !== (t_value = /*id*/ ctx[7] + "")) set_data_dev(t, t_value);

    			if (dirty & /*menus*/ 2 && option_value_value !== (option_value_value = /*id*/ ctx[7])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(75:20) {#each menus as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div4;
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let select;
    	let t10;
    	let div3;
    	let button0;
    	let t12;
    	let a;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*menus*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add an Item";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Layout";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Views";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Menu auswählen";
    			t9 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Item";
    			t12 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Item overview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$1, 52, 8, 1117);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$1, 56, 16, 1218);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$1, 57, 16, 1283);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$1, 55, 12, 1182);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$1, 64, 16, 1523);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$1, 65, 16, 1587);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$1, 63, 12, 1487);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$1, 72, 16, 1829);
    			attr_dev(select, "class", "form-select");
    			if (/*item*/ ctx[0].menu_id === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$1, 73, 16, 1902);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$1, 71, 12, 1793);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$1, 80, 16, 2226);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$1, 84, 20, 2411);
    			attr_dev(a, "href", "#/navigation");
    			add_location(a, file$1, 83, 16, 2366);
    			attr_dev(div3, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div3, file$1, 79, 12, 2149);
    			add_location(form, file$1, 54, 8, 1162);
    			attr_dev(div4, "class", "mb-5");
    			add_location(div4, file$1, 51, 4, 1089);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$1, 50, 0, 1060);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, h1);
    			append_dev(div4, t1);
    			append_dev(div4, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*item*/ ctx[0].layout);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*item*/ ctx[0].ctrViews);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*item*/ ctx[0].menu_id);
    			append_dev(form, t10);
    			append_dev(form, div3);
    			append_dev(div3, button0);
    			append_dev(div3, t12);
    			append_dev(div3, a);
    			append_dev(a, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*addItem*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item, menus*/ 3 && input0.value !== /*item*/ ctx[0].layout) {
    				set_input_value(input0, /*item*/ ctx[0].layout);
    			}

    			if (dirty & /*item, menus*/ 3 && input1.value !== /*item*/ ctx[0].ctrViews) {
    				set_input_value(input1, /*item*/ ctx[0].ctrViews);
    			}

    			if (dirty & /*menus*/ 2) {
    				each_value = /*menus*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*item, menus*/ 3) {
    				select_option(select, /*item*/ ctx[0].menu_id);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreateItem", slots, []);
    	let item = { layout: "", ctrViews: null, menu_id: -1 };
    	let menus = [];

    	onMount(() => {
    		getMenus();
    	});

    	function getMenus() {
    		axios.get("http://localhost:8080/website/menus").then(response => {
    			$$invalidate(1, menus = []);

    			for (let menu of response.data) {
    				menus.push(menu.id + " - " + menu.label);
    			}

    			$$invalidate(0, item.menu_id = menus[0], item);
    		});
    	}

    	function addItem() {
    		let menuComponents = item.menu_id.split("-");

    		axios.post("http://localhost:8080/website/items/" + menuComponents[0], item).then(response => {
    			alert("Item: " + item.layout + " added");
    			$$invalidate(0, item.layout = "", item);
    			$$invalidate(0, item.ctrViews = null, item);
    			$$invalidate(0, item.menu_id = null, item);
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CreateItem> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		item.layout = this.value;
    		$$invalidate(0, item);
    		$$invalidate(1, menus);
    	}

    	function input1_input_handler() {
    		item.ctrViews = this.value;
    		$$invalidate(0, item);
    		$$invalidate(1, menus);
    	}

    	function select_change_handler() {
    		item.menu_id = select_value(this);
    		$$invalidate(0, item);
    		$$invalidate(1, menus);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		item,
    		menus,
    		getMenus,
    		addItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("menus" in $$props) $$invalidate(1, menus = $$props.menus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		item,
    		menus,
    		addItem,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class CreateItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateItem",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    // Project X: Website

    // Export the route definition object
    var routes = {
        // Exact path
        '/': Home,
        '/home': Home,

        // Page
        '/page': Page,
        '/create-page': CreatePage,

        // Provision
        '/provision': Provision,
        '/create-provision': CreateProvision,

        //Navigation
        '/navigation': Navigation,
        '/navigation/menu': Menu,
        '/create-menu': CreateMenu,
        '/navigation/item': Item,
        '/create-item': CreateItem,
    };

    /* src\App.svelte generated by Svelte v3.37.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let a0;
    	let t1;
    	let button;
    	let span;
    	let t2;
    	let div0;
    	let ul;
    	let li0;
    	let a1;
    	let t4;
    	let li1;
    	let a2;
    	let t6;
    	let li2;
    	let a3;
    	let t8;
    	let div2;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Project X: Website";
    			t1 = space();
    			button = element("button");
    			span = element("span");
    			t2 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Page";
    			t4 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Provision";
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Navigation";
    			t8 = space();
    			div2 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file, 8, 8, 232);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 18, 12, 601);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarNavDropdown");
    			attr_dev(button, "aria-controls", "navbarNavDropdown");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 9, 8, 297);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "#/page");
    			add_location(a1, file, 23, 20, 820);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file, 22, 16, 778);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "#/provision");
    			add_location(a2, file, 26, 20, 945);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file, 25, 16, 903);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "#/navigation");
    			add_location(a3, file, 29, 20, 1080);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file, 28, 16, 1038);
    			attr_dev(ul, "class", "navbar-nav");
    			add_location(ul, file, 21, 12, 738);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarNavDropdown");
    			add_location(div0, file, 20, 8, 664);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file, 7, 4, 194);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light bg-light");
    			add_location(nav, file, 6, 0, 130);
    			attr_dev(div2, "class", "container mt-3");
    			add_location(div2, file, 36, 0, 1211);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(router, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div2);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
