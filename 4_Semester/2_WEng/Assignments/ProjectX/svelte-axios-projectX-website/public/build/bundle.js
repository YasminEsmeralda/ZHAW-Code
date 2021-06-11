
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
    function to_number(value) {
        return value === '' ? null : +value;
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

    const { Error: Error_1, Object: Object_1, console: console_1$c } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
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
    		id: create_fragment$m.name,
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

    function instance$m($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$c.warn(`<Router> was created with unknown prop '${key}'`);
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

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$m.name
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

    const file$l = "src\\pages\\Home.svelte";

    function create_fragment$l(ctx) {
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
    			add_location(h1, file$l, 0, 0, 0);
    			attr_dev(img, "class", "img-fluid logo svelte-urh3vn");
    			attr_dev(img, "alt", "Svelte Logo");
    			if (img.src !== (img_src_value = "images/professionelle-webseite.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$l, 3, 4, 119);
    			attr_dev(div, "class", "my-5");
    			set_style(div, "text-align", "center");
    			add_location(div, file$l, 2, 0, 69);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\pages\DemoPage.svelte generated by Svelte v3.37.0 */

    const file$k = "src\\pages\\DemoPage.svelte";

    function create_fragment$k(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "This is a demo page";
    			add_location(h1, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DemoPage", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoPage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class DemoPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoPage",
    			options,
    			id: create_fragment$k.name
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

    const { console: console_1$b } = globals;
    const file$j = "src\\pages\\pages\\page.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (65:16) {#each page.provisions as provision}
    function create_each_block_1$3(ctx) {
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
    			add_location(td0, file$j, 66, 24, 2094);
    			add_location(p, file$j, 70, 28, 2233);
    			add_location(td1, file$j, 69, 24, 2199);
    			add_location(tr, file$j, 65, 20, 2064);
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(65:16) {#each page.provisions as provision}",
    		ctx
    	});

    	return block;
    }

    // (45:2) {#each pages as page}
    function create_each_block$c(ctx) {
    	let div4;
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
    	let div2_data_bs_parent_value;
    	let t13;
    	let div4_id_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*page*/ ctx[3].provisions;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
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
    			add_location(strong0, file$j, 49, 10, 1385);
    			attr_dev(button0, "class", "accordion-button");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-toggle", "collapse");
    			attr_dev(button0, "data-bs-target", button0_data_bs_target_value = "#collapse" + /*page*/ ctx[3].id);
    			attr_dev(button0, "aria-expanded", "true");
    			attr_dev(button0, "aria-controls", button0_aria_controls_value = "collapse" + /*page*/ ctx[3].id);
    			add_location(button0, file$j, 48, 8, 1209);
    			attr_dev(h2, "class", "accordion-header");
    			attr_dev(h2, "id", h2_id_value = "flush-heading" + /*page*/ ctx[3].id);
    			add_location(h2, file$j, 47, 6, 1142);
    			add_location(strong1, file$j, 54, 13, 1653);
    			add_location(p0, file$j, 54, 10, 1650);
    			add_location(strong2, file$j, 55, 13, 1714);
    			add_location(p1, file$j, 55, 10, 1711);
    			add_location(th0, file$j, 59, 20, 1876);
    			add_location(th1, file$j, 60, 20, 1909);
    			add_location(tr, file$j, 58, 16, 1850);
    			add_location(thead, file$j, 57, 12, 1825);
    			add_location(tbody, file$j, 63, 12, 1981);
    			attr_dev(table, "class", "table");
    			add_location(table, file$j, 56, 10, 1790);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-danger");
    			add_location(button1, file$j, 77, 12, 2500);
    			attr_dev(div0, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div0, file$j, 76, 10, 2427);
    			attr_dev(div1, "class", "accordion-body");
    			add_location(div1, file$j, 53, 8, 1610);
    			attr_dev(div2, "id", div2_id_value = "collapse" + /*page*/ ctx[3].id);
    			attr_dev(div2, "class", "accordion-collapse collapse");
    			attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value = "flush-heading" + /*page*/ ctx[3].id);
    			attr_dev(div2, "data-bs-parent", div2_data_bs_parent_value = "#accordingFlush" + /*page*/ ctx[3].id);
    			add_location(div2, file$j, 52, 6, 1453);
    			attr_dev(div3, "class", "accordion-item");
    			add_location(div3, file$j, 46, 4, 1106);
    			attr_dev(div4, "class", "accordion according-flush mb-1");
    			attr_dev(div4, "id", div4_id_value = "accordingFlush" + /*page*/ ctx[3].id);
    			add_location(div4, file$j, 45, 2, 1027);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
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
    			append_dev(div4, t13);

    			if (!mounted) {
    				dispose = listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*deletePage*/ ctx[1](/*page*/ ctx[3].id))) /*deletePage*/ ctx[1](/*page*/ ctx[3].id).apply(this, arguments);
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

    			if (dirty & /*pages*/ 1 && button0_data_bs_target_value !== (button0_data_bs_target_value = "#collapse" + /*page*/ ctx[3].id)) {
    				attr_dev(button0, "data-bs-target", button0_data_bs_target_value);
    			}

    			if (dirty & /*pages*/ 1 && button0_aria_controls_value !== (button0_aria_controls_value = "collapse" + /*page*/ ctx[3].id)) {
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
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*pages*/ 1 && div2_id_value !== (div2_id_value = "collapse" + /*page*/ ctx[3].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}

    			if (dirty & /*pages*/ 1 && div2_aria_labelledby_value !== (div2_aria_labelledby_value = "flush-heading" + /*page*/ ctx[3].id)) {
    				attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value);
    			}

    			if (dirty & /*pages*/ 1 && div2_data_bs_parent_value !== (div2_data_bs_parent_value = "#accordingFlush" + /*page*/ ctx[3].id)) {
    				attr_dev(div2, "data-bs-parent", div2_data_bs_parent_value);
    			}

    			if (dirty & /*pages*/ 1 && div4_id_value !== (div4_id_value = "accordingFlush" + /*page*/ ctx[3].id)) {
    				attr_dev(div4, "id", div4_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(45:2) {#each pages as page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let each_value = /*pages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Pages";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Page";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$j, 34, 4, 731);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$j, 38, 8, 874);
    			attr_dev(div0, "class", "d-grid gap-1");
    			add_location(div0, file$j, 37, 6, 838);
    			attr_dev(a, "href", "#/create-page");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$j, 36, 4, 775);
    			add_location(div1, file$j, 33, 0, 720);
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
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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

    	function deletePage(id) {
    		axios.delete("http://localhost:8080/website/pages/" + id).then(response => {
    			alert("Page deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$b.warn(`<Page> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\pages\pages\CreatePage.svelte generated by Svelte v3.37.0 */

    const { console: console_1$a } = globals;
    const file$i = "src\\pages\\pages\\CreatePage.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (52:16) {#each languages as language}
    function create_each_block$b(ctx) {
    	let option;
    	let t_value = /*language*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*language*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file$i, 52, 20, 1417);
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
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(52:16) {#each languages as language}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div4;
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
    	let div3;
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
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add an Page";
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
    			div3 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Page";
    			t9 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Pageoverview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$i, 36, 4, 893);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$i, 40, 12, 982);
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "type", "text");
    			add_location(input, file$i, 41, 12, 1041);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$i, 39, 8, 950);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$i, 49, 12, 1230);
    			attr_dev(select, "class", "form-select");
    			if (/*page*/ ctx[0].language === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$i, 50, 12, 1293);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$i, 48, 8, 1198);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$i, 59, 16, 1616);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$i, 63, 20, 1795);
    			attr_dev(a, "href", "#/page");
    			add_location(a, file$i, 62, 16, 1756);
    			attr_dev(div2, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div2, file$i, 58, 12, 1539);
    			add_location(div3, file$i, 57, 8, 1520);
    			add_location(form, file$i, 38, 4, 934);
    			attr_dev(div4, "class", "mb-5");
    			add_location(div4, file$i, 35, 0, 869);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h1);
    			append_dev(div4, t1);
    			append_dev(div4, form);
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
    			append_dev(form, div3);
    			append_dev(div3, div2);
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
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    			alert("Page added");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$a.warn(`<CreatePage> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePage",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\pages\provisions\provision.svelte generated by Svelte v3.37.0 */

    const { console: console_1$9 } = globals;
    const file$h = "src\\pages\\provisions\\provision.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (55:10) {#each provisions as provision}
    function create_each_block$a(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*provision*/ ctx[3].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let p;
    	let t2;
    	let t3_value = /*provision*/ ctx[3].dateFrom + "";
    	let t3;
    	let t4;
    	let t5_value = /*provision*/ ctx[3].dateTo + "";
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
    			add_location(td0, file$h, 56, 16, 1408);
    			add_location(p, file$h, 60, 20, 1515);
    			add_location(td1, file$h, 59, 16, 1489);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-outline-danger");
    			add_location(button, file$h, 64, 20, 1718);
    			attr_dev(div, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div, file$h, 63, 18, 1637);
    			add_location(td2, file$h, 62, 16, 1613);
    			add_location(tr, file$h, 55, 12, 1386);
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
    						if (is_function(/*deleteProvision*/ ctx[1](/*provision*/ ctx[3].id))) /*deleteProvision*/ ctx[1](/*provision*/ ctx[3].id).apply(this, arguments);
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
    			if (dirty & /*provisions*/ 1 && t0_value !== (t0_value = /*provision*/ ctx[3].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*provisions*/ 1 && t3_value !== (t3_value = /*provision*/ ctx[3].dateFrom + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*provisions*/ 1 && t5_value !== (t5_value = /*provision*/ ctx[3].dateTo + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(55:10) {#each provisions as provision}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let p;
    	let strong;
    	let t5;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t7;
    	let th1;
    	let t9;
    	let th2;
    	let t10;
    	let tbody;
    	let each_value = /*provisions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
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
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "This Page provides the following Provisions";
    			t5 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t7 = space();
    			th1 = element("th");
    			th1.textContent = "Date";
    			t9 = space();
    			th2 = element("th");
    			t10 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$h, 34, 4, 771);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$h, 38, 8, 918);
    			attr_dev(div0, "class", "d-grid gap-2");
    			add_location(div0, file$h, 37, 6, 882);
    			attr_dev(a, "href", "#/create-provision");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$h, 36, 4, 814);
    			add_location(strong, file$h, 44, 9, 1058);
    			add_location(p, file$h, 44, 6, 1055);
    			add_location(th0, file$h, 48, 16, 1204);
    			add_location(th1, file$h, 49, 16, 1233);
    			add_location(th2, file$h, 50, 16, 1264);
    			add_location(tr, file$h, 47, 12, 1182);
    			add_location(thead, file$h, 46, 8, 1161);
    			add_location(tbody, file$h, 53, 8, 1320);
    			attr_dev(table, "class", "table");
    			add_location(table, file$h, 45, 6, 1130);
    			add_location(div1, file$h, 33, 0, 760);
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
    			append_dev(div1, p);
    			append_dev(p, strong);
    			append_dev(div1, t5);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t7);
    			append_dev(tr, th1);
    			append_dev(tr, t9);
    			append_dev(tr, th2);
    			append_dev(table, t10);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteProvision, provisions*/ 3) {
    				each_value = /*provisions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
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
    			alert("Provision deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$9.warn(`<Provision> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		provisions,
    		getProvisions,
    		deleteProvision
    	});

    	$$self.$inject_state = $$props => {
    		if ("provisions" in $$props) $$invalidate(0, provisions = $$props.provisions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [provisions, deleteProvision];
    }

    class Provision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Provision",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\pages\provisions\createProvision.svelte generated by Svelte v3.37.0 */

    const { console: console_1$8 } = globals;
    const file$g = "src\\pages\\provisions\\createProvision.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (83:16) {#each pages as id}
    function create_each_block_1$2(ctx) {
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
    			add_location(option, file$g, 83, 20, 2366);
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(83:16) {#each pages as id}",
    		ctx
    	});

    	return block;
    }

    // (91:16) {#each navigations as id}
    function create_each_block$9(ctx) {
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
    			add_location(option, file$g, 91, 20, 2695);
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
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(91:16) {#each navigations as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div6;
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let strong;
    	let t4;
    	let form;
    	let div0;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let div1;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let div2;
    	let label2;
    	let t12;
    	let select0;
    	let t13;
    	let div3;
    	let label3;
    	let t15;
    	let select1;
    	let t16;
    	let div5;
    	let div4;
    	let button0;
    	let t18;
    	let a;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*pages*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*navigations*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add an Provision";
    			t1 = space();
    			p = element("p");
    			t2 = text("enter date in format: ");
    			strong = element("strong");
    			strong.textContent = "\"yyyy-mm-dd\"";
    			t4 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Date From";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Date To";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Page";
    			t12 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t13 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Navigation Layout";
    			t15 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			div5 = element("div");
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Provision";
    			t18 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Provisionverview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$g, 58, 4, 1513);
    			add_location(strong, file$g, 60, 29, 1584);
    			add_location(p, file$g, 60, 4, 1559);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$g, 64, 12, 1673);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$g, 65, 12, 1737);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$g, 63, 8, 1641);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$g, 72, 12, 1933);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$g, 73, 12, 1995);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$g, 71, 8, 1901);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$g, 80, 12, 2189);
    			attr_dev(select0, "class", "form-select");
    			if (/*provision*/ ctx[0].page_id === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[6].call(select0));
    			add_location(select0, file$g, 81, 12, 2248);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$g, 79, 8, 2157);
    			attr_dev(label3, "for", "");
    			attr_dev(label3, "class", "form-label");
    			add_location(label3, file$g, 88, 12, 2493);
    			attr_dev(select1, "class", "form-select");
    			if (/*provision*/ ctx[0].navigation_id === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file$g, 89, 12, 2565);
    			attr_dev(div3, "class", "mb-3");
    			add_location(div3, file$g, 87, 8, 2461);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$g, 97, 16, 2886);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$g, 101, 20, 3080);
    			attr_dev(a, "href", "#/provision");
    			add_location(a, file$g, 100, 16, 3036);
    			attr_dev(div4, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div4, file$g, 96, 12, 2809);
    			add_location(div5, file$g, 95, 8, 2790);
    			add_location(form, file$g, 62, 4, 1625);
    			attr_dev(div6, "class", "mb-5");
    			add_location(div6, file$g, 57, 0, 1489);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, h1);
    			append_dev(div6, t1);
    			append_dev(div6, p);
    			append_dev(p, t2);
    			append_dev(p, strong);
    			append_dev(div6, t4);
    			append_dev(div6, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t6);
    			append_dev(div0, input0);
    			set_input_value(input0, /*provision*/ ctx[0].dateFrom);
    			append_dev(form, t7);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t9);
    			append_dev(div1, input1);
    			set_input_value(input1, /*provision*/ ctx[0].dateTo);
    			append_dev(form, t10);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t12);
    			append_dev(div2, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*provision*/ ctx[0].page_id);
    			append_dev(form, t13);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t15);
    			append_dev(div3, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*provision*/ ctx[0].navigation_id);
    			append_dev(form, t16);
    			append_dev(form, div5);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t18);
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
    			if (dirty & /*provision, pages*/ 3 && input0.value !== /*provision*/ ctx[0].dateFrom) {
    				set_input_value(input0, /*provision*/ ctx[0].dateFrom);
    			}

    			if (dirty & /*provision, pages*/ 3 && input1.value !== /*provision*/ ctx[0].dateTo) {
    				set_input_value(input1, /*provision*/ ctx[0].dateTo);
    			}

    			if (dirty & /*pages*/ 2) {
    				each_value_1 = /*pages*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
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
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
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
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    				pages.push(page.id);
    			}

    			$$invalidate(0, provision.page_id = pages[0], provision);
    		});
    	}

    	function getNavigations() {
    		axios.get("http://localhost:8080/website/navigations").then(response => {
    			$$invalidate(2, navigations = []);

    			for (let navigation of response.data) {
    				navigations.push(navigation.id);
    			}

    			$$invalidate(0, provision.navigation_id = navigations[0], provision);
    		});
    	}

    	function addProvision() {
    		axios.post("http://localhost:8080/website/provisions", provision).then(response => {
    			alert("Provision added");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<CreateProvision> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateProvision",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\pages\navigations\navigation.svelte generated by Svelte v3.37.0 */

    const file$f = "src\\pages\\navigations\\navigation.svelte";

    function create_fragment$f(ctx) {
    	let div14;
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
    	let t25;
    	let div13;
    	let div12;
    	let h52;
    	let t27;
    	let p2;
    	let t28;
    	let br4;
    	let t29;
    	let br5;
    	let t30;
    	let t31;
    	let a4;
    	let div11;
    	let button4;
    	let t32;
    	let strong2;
    	let t34;

    	const block = {
    		c: function create() {
    			div14 = element("div");
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
    			t6 = text("In the Page Menus you will find an overview with submenus and the participating items.\r\n              ");
    			br0 = element("br");
    			t7 = space();
    			br1 = element("br");
    			t8 = text("\r\n              Menu has the attribut label to check for the name of the current menu.");
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
    			t18 = text("In the Page Item you will find an overview with items and the participating menus.\r\n              ");
    			br2 = element("br");
    			t19 = space();
    			br3 = element("br");
    			t20 = text("\r\n              Item has the attribut views which shows you the amount of page views.");
    			t21 = space();
    			a3 = element("a");
    			div6 = element("div");
    			button3 = element("button");
    			t22 = text("click here to go the ");
    			strong1 = element("strong");
    			strong1.textContent = "item";
    			t24 = text(" list");
    			t25 = space();
    			div13 = element("div");
    			div12 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Navigation";
    			t27 = space();
    			p2 = element("p");
    			t28 = text("In this Page you will find the Navigations.\r\n        ");
    			br4 = element("br");
    			t29 = space();
    			br5 = element("br");
    			t30 = text("\r\n         Navigation has the combited attributs of menu and item.");
    			t31 = space();
    			a4 = element("a");
    			div11 = element("div");
    			button4 = element("button");
    			t32 = text("click here to go the ");
    			strong2 = element("strong");
    			strong2.textContent = "navigation";
    			t34 = text(" list");
    			attr_dev(h1, "class", "mb-3");
    			add_location(h1, file$f, 1, 2, 22);
    			attr_dev(button0, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$f, 7, 12, 238);
    			attr_dev(div0, "class", "d-grid gap-2");
    			add_location(div0, file$f, 6, 10, 198);
    			attr_dev(a0, "href", "#/create-menu");
    			set_style(a0, "text-decoration", "none");
    			add_location(a0, file$f, 5, 8, 131);
    			attr_dev(h50, "class", "card-title");
    			add_location(h50, file$f, 14, 12, 465);
    			add_location(br0, file$f, 17, 14, 650);
    			add_location(br1, file$f, 18, 14, 672);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$f, 15, 12, 511);
    			add_location(strong0, file$f, 24, 39, 1007);
    			attr_dev(button1, "class", "btn btn-warning mb-3");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$f, 23, 16, 915);
    			attr_dev(div1, "class", "d-grid gap-2");
    			add_location(div1, file$f, 22, 14, 871);
    			attr_dev(a1, "href", "#/navigation/menu");
    			set_style(a1, "text-decoration", "none");
    			add_location(a1, file$f, 21, 12, 796);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$f, 13, 10, 428);
    			attr_dev(div3, "class", "card");
    			add_location(div3, file$f, 12, 8, 398);
    			attr_dev(div4, "class", "col-sm-6");
    			add_location(div4, file$f, 4, 6, 99);
    			attr_dev(button2, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$f, 34, 12, 1293);
    			attr_dev(div5, "class", "d-grid gap-2");
    			add_location(div5, file$f, 33, 10, 1253);
    			attr_dev(a2, "href", "#/create-item");
    			set_style(a2, "text-decoration", "none");
    			add_location(a2, file$f, 32, 8, 1186);
    			attr_dev(h51, "class", "card-title");
    			add_location(h51, file$f, 41, 12, 1520);
    			add_location(br2, file$f, 44, 14, 1701);
    			add_location(br3, file$f, 45, 14, 1723);
    			attr_dev(p1, "class", "card-text");
    			add_location(p1, file$f, 42, 12, 1566);
    			add_location(strong1, file$f, 51, 39, 2057);
    			attr_dev(button3, "class", "btn btn-warning mb-3");
    			attr_dev(button3, "type", "button");
    			add_location(button3, file$f, 50, 16, 1965);
    			attr_dev(div6, "class", "d-grid gap-2");
    			add_location(div6, file$f, 49, 14, 1921);
    			attr_dev(a3, "href", "#/navigation/item");
    			set_style(a3, "text-decoration", "none");
    			add_location(a3, file$f, 48, 12, 1846);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$f, 40, 10, 1483);
    			attr_dev(div8, "class", "card");
    			add_location(div8, file$f, 39, 8, 1453);
    			attr_dev(div9, "class", "col-sm-6");
    			add_location(div9, file$f, 31, 6, 1154);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$f, 3, 2, 74);
    			attr_dev(h52, "class", "card-title");
    			add_location(h52, file$f, 61, 6, 2270);
    			add_location(br4, file$f, 64, 8, 2400);
    			add_location(br5, file$f, 65, 9, 2417);
    			attr_dev(p2, "class", "card-text");
    			add_location(p2, file$f, 62, 6, 2316);
    			add_location(strong2, file$f, 71, 33, 2712);
    			attr_dev(button4, "class", "btn btn-warning mb-3");
    			attr_dev(button4, "type", "button");
    			add_location(button4, file$f, 70, 10, 2626);
    			attr_dev(div11, "class", "d-grid gap-2");
    			add_location(div11, file$f, 69, 8, 2588);
    			attr_dev(a4, "href", "#/navigation/navigationList");
    			set_style(a4, "text-decoration", "none");
    			add_location(a4, file$f, 68, 6, 2509);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$f, 60, 4, 2239);
    			attr_dev(div13, "class", "card mt-3");
    			add_location(div13, file$f, 59, 2, 2210);
    			attr_dev(div14, "class", "mb-5");
    			add_location(div14, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, h1);
    			append_dev(div14, t1);
    			append_dev(div14, div10);
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
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, h52);
    			append_dev(div12, t27);
    			append_dev(div12, p2);
    			append_dev(p2, t28);
    			append_dev(p2, br4);
    			append_dev(p2, t29);
    			append_dev(p2, br5);
    			append_dev(p2, t30);
    			append_dev(div12, t31);
    			append_dev(div12, a4);
    			append_dev(a4, div11);
    			append_dev(div11, button4);
    			append_dev(button4, t32);
    			append_dev(button4, strong2);
    			append_dev(button4, t34);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\pages\navigations\navigationList.svelte generated by Svelte v3.37.0 */
    const file$e = "src\\pages\\navigations\\navigationList.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (40:4) {#each navigations as navigation}
    function create_each_block$8(ctx) {
    	let p0;
    	let t0_value = /*navigation*/ ctx[6].label + "";
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let p1;
    	let t3_value = /*navigation*/ ctx[6].ctrViews + "";
    	let t3;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			add_location(p0, file$e, 41, 8, 881);
    			add_location(br, file$e, 42, 8, 916);
    			add_location(p1, file$e, 43, 8, 932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navigations*/ 1 && t0_value !== (t0_value = /*navigation*/ ctx[6].label + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*navigations*/ 1 && t3_value !== (t3_value = /*navigation*/ ctx[6].ctrViews + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(40:4) {#each navigations as navigation}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let each_value = /*navigations*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Pages";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$e, 37, 4, 740);
    			add_location(div, file$e, 36, 0, 729);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navigations*/ 1) {
    				each_value = /*navigations*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavigationList", slots, []);
    	let { params = {} } = $$props;
    	let navigations = [];
    	let items = {};
    	let itemId;

    	onMount(() => {
    		getNavigations();
    	});

    	function getNavigations() {
    		axios.get("http://localhost:8080/website/navigations/").then(response => {
    			$$invalidate(0, navigations = response.data);
    		});
    	}

    	function getItemById() {
    		axios.get("http://localhost:8080/website/items/" + itemId).then(response => {
    			items = response.data;
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavigationList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		params,
    		navigations,
    		items,
    		itemId,
    		getNavigations,
    		getItemById
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    		if ("navigations" in $$props) $$invalidate(0, navigations = $$props.navigations);
    		if ("items" in $$props) items = $$props.items;
    		if ("itemId" in $$props) itemId = $$props.itemId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 2) {
    			{
    				itemId = params.id;
    				getItemById();
    			}
    		}
    	};

    	return [navigations, params];
    }

    class NavigationList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { params: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationList",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get params() {
    		throw new Error("<NavigationList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<NavigationList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\reusable\backButton.svelte generated by Svelte v3.37.0 */

    const file$d = "src\\pages\\reusable\\backButton.svelte";

    function create_fragment$d(ctx) {
    	let a;
    	let button;

    	const block = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			button.textContent = "Go back to navigationtype selection";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$d, 1, 4, 29);
    			attr_dev(a, "href", "#/navigation");
    			add_location(a, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackButton",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\pages\navigations\menus\menu.svelte generated by Svelte v3.37.0 */

    const { console: console_1$7 } = globals;
    const file$c = "src\\pages\\navigations\\menus\\menu.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (66:14) {#each menu.navigations as navigation}
    function create_each_block_1$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*navigation*/ ctx[6].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*navigation*/ ctx[6].layout + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(td0, file$c, 67, 22, 2068);
    			add_location(td1, file$c, 70, 22, 2168);
    			add_location(tr, file$c, 66, 18, 2040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus*/ 1 && t0_value !== (t0_value = /*navigation*/ ctx[6].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*menus*/ 1 && t2_value !== (t2_value = /*navigation*/ ctx[6].layout + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(66:14) {#each menu.navigations as navigation}",
    		ctx
    	});

    	return block;
    }

    // (46:0) {#each menus as menu}
    function create_each_block$7(ctx) {
    	let div4;
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
    	let tbody;
    	let t12;
    	let div0;
    	let button1;
    	let div2_id_value;
    	let div2_aria_labelledby_value;
    	let div2_data_bs_parent_value;
    	let div4_id_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*menu*/ ctx[3].navigations;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
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
    			th1.textContent = "Layout";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			div0 = element("div");
    			button1 = element("button");
    			button1.textContent = "Delete Page";
    			add_location(strong0, file$c, 50, 8, 1385);
    			attr_dev(button0, "class", "accordion-button");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-toggle", "collapse");
    			attr_dev(button0, "data-bs-target", button0_data_bs_target_value = "#collapse" + /*menu*/ ctx[3].id);
    			attr_dev(button0, "aria-expanded", "true");
    			attr_dev(button0, "aria-controls", button0_aria_controls_value = "collapse" + /*menu*/ ctx[3].id);
    			add_location(button0, file$c, 49, 6, 1211);
    			attr_dev(h2, "class", "accordion-header");
    			attr_dev(h2, "id", h2_id_value = "flush-heading" + /*menu*/ ctx[3].id);
    			add_location(h2, file$c, 48, 4, 1146);
    			add_location(strong1, file$c, 55, 11, 1646);
    			add_location(p0, file$c, 55, 8, 1643);
    			add_location(strong2, file$c, 56, 11, 1701);
    			add_location(p1, file$c, 56, 8, 1698);
    			add_location(th0, file$c, 60, 18, 1860);
    			add_location(th1, file$c, 61, 18, 1891);
    			add_location(tr, file$c, 59, 14, 1836);
    			add_location(thead, file$c, 58, 10, 1813);
    			add_location(tbody, file$c, 64, 10, 1959);
    			attr_dev(table, "class", "table");
    			add_location(table, file$c, 57, 8, 1780);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-danger");
    			add_location(button1, file$c, 78, 10, 2415);
    			attr_dev(div0, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div0, file$c, 77, 8, 2344);
    			attr_dev(div1, "class", "accordion-body");
    			add_location(div1, file$c, 54, 6, 1605);
    			attr_dev(div2, "id", div2_id_value = "collapse" + /*menu*/ ctx[3].id);
    			attr_dev(div2, "class", "accordion-collapse collapse");
    			attr_dev(div2, "aria-labelledby", div2_aria_labelledby_value = "flush-heading" + /*menu*/ ctx[3].id);
    			attr_dev(div2, "data-bs-parent", div2_data_bs_parent_value = "#according" + /*menu*/ ctx[3].id);
    			add_location(div2, file$c, 53, 4, 1455);
    			attr_dev(div3, "class", "accordion-item");
    			add_location(div3, file$c, 47, 2, 1112);
    			attr_dev(div4, "class", "accordion according-flush mb-1");
    			attr_dev(div4, "id", div4_id_value = "according" + /*menu*/ ctx[3].id);
    			add_location(div4, file$c, 46, 0, 1040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
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
    			append_dev(table, t11);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div1, t12);
    			append_dev(div1, div0);
    			append_dev(div0, button1);

    			if (!mounted) {
    				dispose = listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*deleteMenu*/ ctx[1](/*menu*/ ctx[3].id))) /*deleteMenu*/ ctx[1](/*menu*/ ctx[3].id).apply(this, arguments);
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
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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

    			if (dirty & /*menus*/ 1 && div2_data_bs_parent_value !== (div2_data_bs_parent_value = "#according" + /*menu*/ ctx[3].id)) {
    				attr_dev(div2, "data-bs-parent", div2_data_bs_parent_value);
    			}

    			if (dirty & /*menus*/ 1 && div4_id_value !== (div4_id_value = "according" + /*menu*/ ctx[3].id)) {
    				attr_dev(div4, "id", div4_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(46:0) {#each menus as menu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let a;
    	let div0;
    	let button;
    	let t3;
    	let t4;
    	let backbutton;
    	let current;
    	let each_value = /*menus*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	backbutton = new BackButton({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Menu";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Menu";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(backbutton.$$.fragment);
    			add_location(h1, file$c, 35, 2, 763);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$c, 39, 6, 899);
    			attr_dev(div0, "class", "d-grid gap-1");
    			add_location(div0, file$c, 38, 4, 865);
    			attr_dev(a, "href", "#/create-menu");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$c, 37, 2, 804);
    			add_location(div1, file$c, 34, 0, 754);
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t4);
    			mount_component(backbutton, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*menus, deleteMenu*/ 3) {
    				each_value = /*menus*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t4);
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
    			destroy_each(each_blocks, detaching);
    			destroy_component(backbutton);
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

    function instance$c($$self, $$props, $$invalidate) {
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

    	function deleteMenu(id) {
    		axios.delete("http://localhost:8080/website/menus/" + id).then(response => {
    			alert("Menu deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Menu> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\pages\navigations\menus\createMenu.svelte generated by Svelte v3.37.0 */

    const { console: console_1$6 } = globals;
    const file$b = "src\\pages\\navigations\\menus\\createMenu.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (66:16) {#each menus as id}
    function create_each_block$6(ctx) {
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
    			add_location(option, file$b, 66, 20, 1763);
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
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(66:16) {#each menus as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
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
    	let select;
    	let t10;
    	let div4;
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
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
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
    			div4 = element("div");
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Item";
    			t12 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Item overview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$b, 43, 4, 994);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$b, 47, 12, 1083);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$b, 48, 12, 1144);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$b, 46, 8, 1051);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$b, 55, 12, 1333);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$b, 56, 12, 1393);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$b, 54, 8, 1301);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$b, 63, 12, 1581);
    			attr_dev(select, "class", "form-select");
    			if (/*menu*/ ctx[0].menu_id === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$b, 64, 12, 1650);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$b, 62, 8, 1549);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$b, 72, 16, 1955);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$b, 76, 20, 2140);
    			attr_dev(a, "href", "#/navigation");
    			add_location(a, file$b, 75, 16, 2095);
    			attr_dev(div3, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div3, file$b, 71, 12, 1878);
    			add_location(div4, file$b, 70, 8, 1859);
    			add_location(form, file$b, 45, 4, 1035);
    			attr_dev(div5, "class", "mb-5");
    			add_location(div5, file$b, 42, 0, 970);
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
    			append_dev(form, div4);
    			append_dev(div4, div3);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    				menus.push(menu.id);
    			}

    			$$invalidate(0, menu.menu_id = menus[0], menu);
    		});
    	}

    	function addMenu() {
    		axios.post("http://localhost:8080/website/menus/", menu).then(response => {
    			alert("Menu added");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<CreateMenu> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateMenu",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\pages\navigations\items\item.svelte generated by Svelte v3.37.0 */

    const { console: console_1$5 } = globals;
    const file$a = "src\\pages\\navigations\\items\\item.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (56:6) {#each items as item}
    function create_each_block$5(ctx) {
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
    			add_location(td0, file$a, 57, 12, 1274);
    			add_location(td1, file$a, 60, 12, 1338);
    			add_location(td2, file$a, 63, 12, 1406);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-outline-danger");
    			add_location(button, file$a, 68, 16, 1569);
    			attr_dev(div, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div, file$a, 67, 14, 1492);
    			add_location(td3, file$a, 66, 12, 1472);
    			add_location(tr, file$a, 56, 8, 1256);
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
    						if (is_function(/*deleteItems*/ ctx[1](/*item*/ ctx[3].id))) /*deleteItems*/ ctx[1](/*item*/ ctx[3].id).apply(this, arguments);
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
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(56:6) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
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
    	let t9;
    	let th3;
    	let t10;
    	let tbody;
    	let t11;
    	let backbutton;
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	backbutton = new BackButton({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all available Menu";
    			t1 = space();
    			a = element("a");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+ Add Menu";
    			t3 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Layout";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "Views";
    			t9 = space();
    			th3 = element("th");
    			t10 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			create_component(backbutton.$$.fragment);
    			add_location(h1, file$a, 35, 2, 764);
    			attr_dev(button, "class", "btn btn-outline-warning mb-3");
    			attr_dev(button, "type", "button");
    			add_location(button, file$a, 39, 6, 900);
    			attr_dev(div0, "class", "d-grid gap-1");
    			add_location(div0, file$a, 38, 4, 866);
    			attr_dev(a, "href", "#/create-item");
    			set_style(a, "text-decoration", "none");
    			add_location(a, file$a, 37, 2, 805);
    			add_location(th0, file$a, 48, 12, 1082);
    			add_location(th1, file$a, 49, 12, 1107);
    			add_location(th2, file$a, 50, 12, 1136);
    			add_location(th3, file$a, 51, 12, 1164);
    			add_location(tr, file$a, 47, 8, 1064);
    			add_location(thead, file$a, 46, 4, 1047);
    			add_location(tbody, file$a, 54, 4, 1208);
    			attr_dev(table, "class", "table");
    			add_location(table, file$a, 45, 2, 1020);
    			add_location(div1, file$a, 34, 0, 755);
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
    			append_dev(tr, t9);
    			append_dev(tr, th3);
    			append_dev(table, t10);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div1, t11);
    			mount_component(backbutton, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteItems, items*/ 3) {
    				each_value = /*items*/ ctx[0];
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
    			destroy_each(each_blocks, detaching);
    			destroy_component(backbutton);
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

    	function deleteItems(id) {
    		axios.delete("http://localhost:8080/website/items/" + id).then(response => {
    			alert("Item deleted");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Item> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\pages\navigations\items\createItem.svelte generated by Svelte v3.37.0 */

    const { console: console_1$4 } = globals;
    const file$9 = "src\\pages\\navigations\\items\\createItem.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (66:16) {#each menus as id}
    function create_each_block$4(ctx) {
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
    			add_location(option, file$9, 66, 20, 1772);
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(66:16) {#each menus as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
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
    	let select;
    	let t10;
    	let div4;
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
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
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
    			div4 = element("div");
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Item";
    			t12 = space();
    			a = element("a");
    			button1 = element("button");
    			button1.textContent = "Back to Item overview";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$9, 43, 4, 1000);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$9, 47, 12, 1089);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$9, 48, 12, 1150);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$9, 46, 8, 1057);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$9, 55, 12, 1339);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$9, 56, 12, 1399);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$9, 54, 8, 1307);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$9, 63, 12, 1590);
    			attr_dev(select, "class", "form-select");
    			if (/*item*/ ctx[0].menu_id === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$9, 64, 12, 1659);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$9, 62, 8, 1558);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-warning");
    			add_location(button0, file$9, 72, 16, 1964);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-warning");
    			add_location(button1, file$9, 76, 20, 2149);
    			attr_dev(a, "href", "#/navigation");
    			add_location(a, file$9, 75, 16, 2104);
    			attr_dev(div3, "class", "d-grid gap-2 d-md-flex justify-content-md-end");
    			add_location(div3, file$9, 71, 12, 1887);
    			add_location(div4, file$9, 70, 8, 1868);
    			add_location(form, file$9, 45, 4, 1041);
    			attr_dev(div5, "class", "mb-5");
    			add_location(div5, file$9, 42, 0, 976);
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
    			append_dev(form, div4);
    			append_dev(div4, div3);
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
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    				menus.push(menu.id);
    			}

    			$$invalidate(0, item.menu_id = menus[0], item);
    		});
    	}

    	function addItem() {
    		axios.post("http://localhost:8080/website/items/", item).then(response => {
    			alert("Item added");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<CreateItem> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateItem",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\pages\infections\Infections.svelte generated by Svelte v3.37.0 */
    const file$8 = "src\\pages\\infections\\Infections.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (36:12) {#each infections as infection}
    function create_each_block$3(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*infection*/ ctx[2].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*infection*/ ctx[2].location + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*infection*/ ctx[2].time + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*infection*/ ctx[2].pathogen.id + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*infection*/ ctx[2].person.id + "";
    	let t8;
    	let t9;

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
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			add_location(td0, file$8, 37, 20, 888);
    			add_location(td1, file$8, 40, 20, 978);
    			add_location(td2, file$8, 43, 20, 1074);
    			add_location(td3, file$8, 46, 20, 1166);
    			add_location(td4, file$8, 49, 20, 1265);
    			add_location(tr, file$8, 36, 16, 863);
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
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*infections*/ 1 && t0_value !== (t0_value = /*infection*/ ctx[2].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*infections*/ 1 && t2_value !== (t2_value = /*infection*/ ctx[2].location + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*infections*/ 1 && t4_value !== (t4_value = /*infection*/ ctx[2].time + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*infections*/ 1 && t6_value !== (t6_value = /*infection*/ ctx[2].pathogen.id + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*infections*/ 1 && t8_value !== (t8_value = /*infection*/ ctx[2].person.id + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(36:12) {#each infections as infection}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let a;
    	let t3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t9;
    	let th3;
    	let t11;
    	let th4;
    	let t13;
    	let tbody;
    	let each_value = /*infections*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all Infections";
    			t1 = space();
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "+ Add Infection";
    			t3 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Location";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "Time";
    			t9 = space();
    			th3 = element("th");
    			th3.textContent = "Pathogen ID";
    			t11 = space();
    			th4 = element("th");
    			th4.textContent = "Person ID";
    			t13 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$8, 20, 4, 406);
    			attr_dev(a, "href", "#/create-infection");
    			add_location(a, file$8, 22, 8, 469);
    			add_location(div0, file$8, 21, 4, 455);
    			add_location(th0, file$8, 27, 16, 604);
    			add_location(th1, file$8, 28, 16, 632);
    			add_location(th2, file$8, 29, 16, 666);
    			add_location(th3, file$8, 30, 16, 696);
    			add_location(th4, file$8, 31, 16, 733);
    			add_location(tr, file$8, 26, 12, 583);
    			add_location(thead, file$8, 25, 8, 563);
    			add_location(tbody, file$8, 34, 8, 795);
    			attr_dev(table, "class", "table");
    			add_location(table, file$8, 24, 4, 533);
    			attr_dev(div1, "class", "mb-5");
    			add_location(div1, file$8, 19, 0, 383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(div1, t3);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(tr, t9);
    			append_dev(tr, th3);
    			append_dev(tr, t11);
    			append_dev(tr, th4);
    			append_dev(table, t13);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*infections*/ 1) {
    				each_value = /*infections*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Infections", slots, []);
    	let infections = [];

    	onMount(() => {
    		getInfections();
    	});

    	function getInfections() {
    		axios.get("http://localhost:8080/infections/infections").then(response => {
    			$$invalidate(0, infections = response.data);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Infections> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		infections,
    		getInfections
    	});

    	$$self.$inject_state = $$props => {
    		if ("infections" in $$props) $$invalidate(0, infections = $$props.infections);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [infections];
    }

    class Infections extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Infections",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\infections\createInfection.svelte generated by Svelte v3.37.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src\\pages\\infections\\createInfection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (82:16) {#each pathogen_ids as id}
    function create_each_block_1(ctx) {
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
    			add_location(option, file$7, 82, 20, 2270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pathogen_ids*/ 4 && t_value !== (t_value = /*id*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*pathogen_ids*/ 4 && option_value_value !== (option_value_value = /*id*/ ctx[10])) {
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(82:16) {#each pathogen_ids as id}",
    		ctx
    	});

    	return block;
    }

    // (90:16) {#each person_ids as id}
    function create_each_block$2(ctx) {
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
    			add_location(option, file$7, 90, 20, 2578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*person_ids*/ 2 && t_value !== (t_value = /*id*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*person_ids*/ 2 && option_value_value !== (option_value_value = /*id*/ ctx[10])) {
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
    		source: "(90:16) {#each person_ids as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
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
    	let select0;
    	let t10;
    	let div3;
    	let label3;
    	let t12;
    	let select1;
    	let t13;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*pathogen_ids*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*person_ids*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add an infection";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Location";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Time";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Pathogen ID";
    			t9 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Person ID";
    			t12 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			button = element("button");
    			button.textContent = "Add Infection";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$7, 59, 4, 1492);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$7, 63, 12, 1582);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$7, 64, 12, 1644);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$7, 62, 8, 1551);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$7, 71, 12, 1833);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$7, 72, 12, 1891);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$7, 70, 8, 1802);
    			attr_dev(label2, "for", "");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$7, 79, 12, 2078);
    			attr_dev(select0, "class", "form-select");
    			if (/*infection*/ ctx[0].pathogen_id === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[6].call(select0));
    			add_location(select0, file$7, 80, 12, 2143);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$7, 78, 8, 2047);
    			attr_dev(label3, "for", "");
    			attr_dev(label3, "class", "form-label");
    			add_location(label3, file$7, 87, 12, 2392);
    			attr_dev(select1, "class", "form-select");
    			if (/*infection*/ ctx[0].person_id === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file$7, 88, 12, 2455);
    			attr_dev(div3, "class", "mb-3");
    			add_location(div3, file$7, 86, 8, 2361);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$7, 94, 8, 2669);
    			add_location(form, file$7, 61, 4, 1536);
    			attr_dev(div4, "class", "mb-5");
    			add_location(div4, file$7, 58, 0, 1469);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h1);
    			append_dev(div4, t1);
    			append_dev(div4, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*infection*/ ctx[0].location);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*infection*/ ctx[0].time);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*infection*/ ctx[0].pathogen_id);
    			append_dev(form, t10);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t12);
    			append_dev(div3, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*infection*/ ctx[0].person_id);
    			append_dev(form, t13);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[6]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[7]),
    					listen_dev(button, "click", /*addInfection*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*infection, pathogen_ids*/ 5 && input0.value !== /*infection*/ ctx[0].location) {
    				set_input_value(input0, /*infection*/ ctx[0].location);
    			}

    			if (dirty & /*infection, pathogen_ids*/ 5 && to_number(input1.value) !== /*infection*/ ctx[0].time) {
    				set_input_value(input1, /*infection*/ ctx[0].time);
    			}

    			if (dirty & /*pathogen_ids*/ 4) {
    				each_value_1 = /*pathogen_ids*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*infection, pathogen_ids*/ 5) {
    				select_option(select0, /*infection*/ ctx[0].pathogen_id);
    			}

    			if (dirty & /*person_ids*/ 2) {
    				each_value = /*person_ids*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*infection, pathogen_ids*/ 5) {
    				select_option(select1, /*infection*/ ctx[0].person_id);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    	validate_slots("CreateInfection", slots, []);

    	let infection = {
    		location: "",
    		time: null,
    		pathogen_id: null,
    		person_id: null
    	};

    	let person_ids = [];
    	let pathogen_ids = [];

    	onMount(() => {
    		getPersonIds();
    		getPathogenIds();
    	});

    	function getPersonIds() {
    		axios.get("http://localhost:8080/infections/persons").then(response => {
    			$$invalidate(1, person_ids = []);

    			for (let person of response.data) {
    				person_ids.push(person.id);
    			}

    			$$invalidate(0, infection.person_id = person_ids[0], infection);
    		});
    	}

    	function getPathogenIds() {
    		axios.get("http://localhost:8080/infections/pathogens").then(response => {
    			$$invalidate(2, pathogen_ids = []);

    			for (let pathogen of response.data) {
    				pathogen_ids.push(pathogen.id);
    			}

    			$$invalidate(0, infection.pathogen_id = pathogen_ids[0], infection);
    		});
    	}

    	function addInfection() {
    		axios.post("http://localhost:8080/infections/infections", infection).then(response => {
    			alert("Infection added");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<CreateInfection> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		infection.location = this.value;
    		$$invalidate(0, infection);
    		$$invalidate(2, pathogen_ids);
    	}

    	function input1_input_handler() {
    		infection.time = to_number(this.value);
    		$$invalidate(0, infection);
    		$$invalidate(2, pathogen_ids);
    	}

    	function select0_change_handler() {
    		infection.pathogen_id = select_value(this);
    		$$invalidate(0, infection);
    		$$invalidate(2, pathogen_ids);
    	}

    	function select1_change_handler() {
    		infection.person_id = select_value(this);
    		$$invalidate(0, infection);
    		$$invalidate(2, pathogen_ids);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		infection,
    		person_ids,
    		pathogen_ids,
    		getPersonIds,
    		getPathogenIds,
    		addInfection
    	});

    	$$self.$inject_state = $$props => {
    		if ("infection" in $$props) $$invalidate(0, infection = $$props.infection);
    		if ("person_ids" in $$props) $$invalidate(1, person_ids = $$props.person_ids);
    		if ("pathogen_ids" in $$props) $$invalidate(2, pathogen_ids = $$props.pathogen_ids);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		infection,
    		person_ids,
    		pathogen_ids,
    		addInfection,
    		input0_input_handler,
    		input1_input_handler,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class CreateInfection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateInfection",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\persons\Persons.svelte generated by Svelte v3.37.0 */
    const file$6 = "src\\pages\\persons\\Persons.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (32:12) {#each persons as person}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*person*/ ctx[2].id + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*person*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*person*/ ctx[2].birthdate + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(a, "href", a_href_value = "#/persons/" + /*person*/ ctx[2].id);
    			add_location(a, file$6, 34, 24, 787);
    			add_location(td0, file$6, 33, 20, 758);
    			add_location(td1, file$6, 38, 20, 938);
    			add_location(td2, file$6, 41, 20, 1027);
    			add_location(tr, file$6, 32, 16, 733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*persons*/ 1 && t0_value !== (t0_value = /*person*/ ctx[2].id + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*persons*/ 1 && a_href_value !== (a_href_value = "#/persons/" + /*person*/ ctx[2].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*persons*/ 1 && t2_value !== (t2_value = /*person*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*persons*/ 1 && t4_value !== (t4_value = /*person*/ ctx[2].birthdate + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(32:12) {#each persons as person}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let a;
    	let t3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t9;
    	let tbody;
    	let each_value = /*persons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all Persons";
    			t1 = space();
    			a = element("a");
    			a.textContent = "+ Add Person";
    			t3 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Name";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "Birthdate";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$6, 20, 4, 387);
    			attr_dev(a, "href", "#/create-person");
    			add_location(a, file$6, 21, 4, 433);
    			add_location(th0, file$6, 25, 16, 551);
    			add_location(th1, file$6, 26, 16, 579);
    			add_location(th2, file$6, 27, 16, 609);
    			add_location(tr, file$6, 24, 12, 530);
    			add_location(thead, file$6, 23, 8, 510);
    			add_location(tbody, file$6, 30, 8, 671);
    			attr_dev(table, "class", "table");
    			add_location(table, file$6, 22, 4, 480);
    			attr_dev(div, "class", "mb-5");
    			add_location(div, file$6, 19, 0, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, a);
    			append_dev(div, t3);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*persons*/ 1) {
    				each_value = /*persons*/ ctx[0];
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Persons", slots, []);
    	let persons = [];

    	onMount(() => {
    		getPersons();
    	});

    	function getPersons() {
    		axios.get("http://localhost:8080/infections/persons").then(response => {
    			$$invalidate(0, persons = response.data);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Persons> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ axios, onMount, persons, getPersons });

    	$$self.$inject_state = $$props => {
    		if ("persons" in $$props) $$invalidate(0, persons = $$props.persons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [persons];
    }

    class Persons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Persons",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\persons\PersonDetails.svelte generated by Svelte v3.37.0 */
    const file$5 = "src\\pages\\persons\\PersonDetails.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p0;
    	let t4;
    	let t5_value = /*person*/ ctx[1].name + "";
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8_value = /*person*/ ctx[1].birthdate + "";
    	let t8;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Person (ID: ");
    			t1 = text(/*personId*/ ctx[0]);
    			t2 = text(")");
    			t3 = space();
    			p0 = element("p");
    			t4 = text("Name: ");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Birthdate: ");
    			t8 = text(t8_value);
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$5, 24, 4, 422);
    			add_location(p0, file$5, 25, 4, 472);
    			add_location(p1, file$5, 26, 4, 503);
    			attr_dev(div, "class", "mb-5");
    			add_location(div, file$5, 23, 0, 399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*personId*/ 1) set_data_dev(t1, /*personId*/ ctx[0]);
    			if (dirty & /*person*/ 2 && t5_value !== (t5_value = /*person*/ ctx[1].name + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*person*/ 2 && t8_value !== (t8_value = /*person*/ ctx[1].birthdate + "")) set_data_dev(t8, t8_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PersonDetails", slots, []);
    	let { params = {} } = $$props;
    	let personId;
    	let person = {};

    	function getPerson() {
    		axios.get("http://localhost:8080/infections/persons/" + personId).then(response => {
    			$$invalidate(1, person = response.data);
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PersonDetails> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		params,
    		personId,
    		person,
    		getPerson
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    		if ("personId" in $$props) $$invalidate(0, personId = $$props.personId);
    		if ("person" in $$props) $$invalidate(1, person = $$props.person);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 4) {
    			{
    				$$invalidate(0, personId = params.id);
    				getPerson();
    			}
    		}
    	};

    	return [personId, person, params];
    }

    class PersonDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { params: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PersonDetails",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get params() {
    		throw new Error("<PersonDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<PersonDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\persons\CreatePerson.svelte generated by Svelte v3.37.0 */

    const { console: console_1$2 } = globals;
    const file$4 = "src\\pages\\persons\\CreatePerson.svelte";

    function create_fragment$4(ctx) {
    	let div2;
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
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add a person";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Birthdate";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Add Person";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$4, 24, 4, 509);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$4, 28, 8, 589);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$4, 29, 8, 643);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$4, 27, 6, 562);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$4, 32, 8, 757);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$4, 33, 8, 816);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$4, 31, 6, 730);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$4, 35, 6, 910);
    			add_location(form, file$4, 26, 4, 549);
    			attr_dev(div2, "class", "mb-5");
    			add_location(div2, file$4, 23, 0, 486);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*person*/ ctx[0].name);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*person*/ ctx[0].birthdate);
    			append_dev(form, t7);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(button, "click", /*addPerson*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*person*/ 1 && input0.value !== /*person*/ ctx[0].name) {
    				set_input_value(input0, /*person*/ ctx[0].name);
    			}

    			if (dirty & /*person*/ 1 && to_number(input1.value) !== /*person*/ ctx[0].birthdate) {
    				set_input_value(input1, /*person*/ ctx[0].birthdate);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("CreatePerson", slots, []);
    	let person = { name: "", birthdate: null };

    	function addPerson() {
    		axios.post("http://localhost:8080/infections/persons", person).then(response => {
    			alert("Person added");
    			console.log(response.data);
    		}).catch(error => {
    			console.log(error);
    			alert(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CreatePerson> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		person.name = this.value;
    		$$invalidate(0, person);
    	}

    	function input1_input_handler() {
    		person.birthdate = to_number(this.value);
    		$$invalidate(0, person);
    	}

    	$$self.$capture_state = () => ({ axios, person, addPerson });

    	$$self.$inject_state = $$props => {
    		if ("person" in $$props) $$invalidate(0, person = $$props.person);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [person, addPerson, input0_input_handler, input1_input_handler];
    }

    class CreatePerson extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePerson",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\pathogens\Pathogens.svelte generated by Svelte v3.37.0 */
    const file$3 = "src\\pages\\pathogens\\Pathogens.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (32:12) {#each pathogens as pathogen}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*pathogen*/ ctx[2].id + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*pathogen*/ ctx[2].icd10 + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*pathogen*/ ctx[2].incubation + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(a, "href", a_href_value = "#/pathogens/" + /*pathogen*/ ctx[2].id);
    			add_location(a, file$3, 34, 20, 802);
    			add_location(td0, file$3, 33, 16, 777);
    			add_location(td1, file$3, 38, 16, 943);
    			add_location(td2, file$3, 41, 16, 1023);
    			add_location(tr, file$3, 32, 16, 756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pathogens*/ 1 && t0_value !== (t0_value = /*pathogen*/ ctx[2].id + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*pathogens*/ 1 && a_href_value !== (a_href_value = "#/pathogens/" + /*pathogen*/ ctx[2].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*pathogens*/ 1 && t2_value !== (t2_value = /*pathogen*/ ctx[2].icd10 + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*pathogens*/ 1 && t4_value !== (t4_value = /*pathogen*/ ctx[2].incubation + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:12) {#each pathogens as pathogen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let a;
    	let t3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t9;
    	let tbody;
    	let each_value = /*pathogens*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "List of all Pathogens";
    			t1 = space();
    			a = element("a");
    			a.textContent = "+ Add Pathogen";
    			t3 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "ICD-10";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "Incubation";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$3, 20, 4, 397);
    			attr_dev(a, "href", "#/create-pathogen");
    			add_location(a, file$3, 21, 4, 445);
    			add_location(th0, file$3, 25, 16, 567);
    			add_location(th1, file$3, 26, 16, 595);
    			add_location(th2, file$3, 27, 16, 627);
    			add_location(tr, file$3, 24, 12, 546);
    			add_location(thead, file$3, 23, 8, 526);
    			add_location(tbody, file$3, 30, 8, 690);
    			attr_dev(table, "class", "table");
    			add_location(table, file$3, 22, 4, 496);
    			attr_dev(div, "class", "mb-5");
    			add_location(div, file$3, 19, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, a);
    			append_dev(div, t3);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pathogens*/ 1) {
    				each_value = /*pathogens*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("Pathogens", slots, []);
    	let pathogens = [];

    	onMount(() => {
    		getPathogens();
    	});

    	function getPathogens() {
    		axios.get("http://localhost:8080/infections/pathogens").then(response => {
    			$$invalidate(0, pathogens = response.data);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pathogens> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ axios, onMount, pathogens, getPathogens });

    	$$self.$inject_state = $$props => {
    		if ("pathogens" in $$props) $$invalidate(0, pathogens = $$props.pathogens);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pathogens];
    }

    class Pathogens extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pathogens",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\pathogens\PathogenDetails.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\pages\\pathogens\\PathogenDetails.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p0;
    	let t4;
    	let t5_value = /*pathogen*/ ctx[1].icd10 + "";
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8_value = /*pathogen*/ ctx[1].incubation + "";
    	let t8;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Pathogen (ID: ");
    			t1 = text(/*pathogenId*/ ctx[0]);
    			t2 = text(")");
    			t3 = space();
    			p0 = element("p");
    			t4 = text("ICD-10: ");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Incubation: ");
    			t8 = text(t8_value);
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$2, 23, 4, 465);
    			add_location(p0, file$2, 24, 4, 519);
    			add_location(p1, file$2, 25, 4, 555);
    			attr_dev(div, "class", "mb-5");
    			add_location(div, file$2, 22, 0, 442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pathogenId*/ 1) set_data_dev(t1, /*pathogenId*/ ctx[0]);
    			if (dirty & /*pathogen*/ 2 && t5_value !== (t5_value = /*pathogen*/ ctx[1].icd10 + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*pathogen*/ 2 && t8_value !== (t8_value = /*pathogen*/ ctx[1].incubation + "")) set_data_dev(t8, t8_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots("PathogenDetails", slots, []);
    	let { params = {} } = $$props;
    	let pathogenId;
    	let pathogen = {};

    	function getPathogen() {
    		console.log("getpa");

    		axios.get("http://localhost:8080/infections/pathogens/" + pathogenId).then(response => {
    			$$invalidate(1, pathogen = response.data);
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<PathogenDetails> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		params,
    		pathogenId,
    		pathogen,
    		getPathogen
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    		if ("pathogenId" in $$props) $$invalidate(0, pathogenId = $$props.pathogenId);
    		if ("pathogen" in $$props) $$invalidate(1, pathogen = $$props.pathogen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 4) {
    			{
    				$$invalidate(0, pathogenId = params.id);
    				getPathogen();
    			}
    		}
    	};

    	return [pathogenId, pathogen, params];
    }

    class PathogenDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { params: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PathogenDetails",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get params() {
    		throw new Error("<PathogenDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<PathogenDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\pathogens\createPathogen.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\pathogens\\createPathogen.svelte";

    function create_fragment$1(ctx) {
    	let div2;
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
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add a pathogen";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "ICD-10";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Incubation";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Add Pathogen";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$1, 18, 4, 381);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$1, 22, 12, 469);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$1, 23, 12, 529);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$1, 21, 8, 438);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$1, 30, 12, 714);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$1, 31, 12, 778);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$1, 29, 8, 683);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 37, 8, 939);
    			add_location(form, file$1, 20, 4, 423);
    			attr_dev(div2, "class", "mb-5");
    			add_location(div2, file$1, 17, 0, 358);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*pathogen*/ ctx[0].icd10);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*pathogen*/ ctx[0].incubation);
    			append_dev(form, t7);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(button, "click", /*addPathogen*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pathogen*/ 1 && input0.value !== /*pathogen*/ ctx[0].icd10) {
    				set_input_value(input0, /*pathogen*/ ctx[0].icd10);
    			}

    			if (dirty & /*pathogen*/ 1 && to_number(input1.value) !== /*pathogen*/ ctx[0].incubation) {
    				set_input_value(input1, /*pathogen*/ ctx[0].incubation);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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
    	validate_slots("CreatePathogen", slots, []);
    	let pathogen = { icd10: "", incubation: null };

    	function addPathogen() {
    		// TODO: POST with axios (like in CreatePerson.svelte)
    		console.log("adding pathogen: " + JSON.stringify(pathogen));

    		// reset input fields
    		$$invalidate(0, pathogen.icd10 = "", pathogen);

    		$$invalidate(0, pathogen.incubation = null, pathogen);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CreatePathogen> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		pathogen.icd10 = this.value;
    		$$invalidate(0, pathogen);
    	}

    	function input1_input_handler() {
    		pathogen.incubation = to_number(this.value);
    		$$invalidate(0, pathogen);
    	}

    	$$self.$capture_state = () => ({ pathogen, addPathogen });

    	$$self.$inject_state = $$props => {
    		if ("pathogen" in $$props) $$invalidate(0, pathogen = $$props.pathogen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pathogen, addPathogen, input0_input_handler, input1_input_handler];
    }

    class CreatePathogen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePathogen",
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
        '/demo': DemoPage,

        // Page
        '/page': Page,
        '/create-page': CreatePage,

        // Provision
        '/provision': Provision,
        '/create-provision': CreateProvision,

        //Navigation
        '/navigation': Navigation,
        '/navigation/navigationList': NavigationList,
        '/navigation/menu': Menu,
        '/create-menu': CreateMenu,
        '/navigation/item': Item,
        '/create-item': CreateItem,

        // infections
        '/infections': Infections,
        '/create-infection': CreateInfection,
        
        // persons
        '/persons': Persons,
        '/persons/:id': PersonDetails,
        '/create-person': CreatePerson,

        // pathogens
        '/pathogens': Pathogens,
        '/pathogens/:id': PathogenDetails,
        '/create-pathogen': CreatePathogen,
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
    	let li3;
    	let a4;
    	let t10;
    	let li4;
    	let a5;
    	let t12;
    	let li5;
    	let a6;
    	let t14;
    	let li6;
    	let a7;
    	let t16;
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
    			a1.textContent = "Demo";
    			t4 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Persons";
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Pathogens";
    			t8 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Infections";
    			t10 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Pages";
    			t12 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Provision";
    			t14 = space();
    			li6 = element("li");
    			a7 = element("a");
    			a7.textContent = "Navigation";
    			t16 = space();
    			div2 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file, 8, 2, 225);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 18, 3, 506);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarNavDropdown");
    			attr_dev(button, "aria-controls", "navbarNavDropdown");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 9, 2, 284);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "#/demo");
    			add_location(a1, file, 23, 5, 677);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file, 22, 4, 650);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "#/persons");
    			add_location(a2, file, 26, 5, 761);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file, 25, 4, 734);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "#/pathogens");
    			add_location(a3, file, 29, 5, 851);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file, 28, 4, 824);
    			attr_dev(a4, "class", "nav-link");
    			attr_dev(a4, "href", "#/infections");
    			add_location(a4, file, 32, 5, 947);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file, 31, 4, 920);
    			attr_dev(a5, "class", "nav-link");
    			attr_dev(a5, "href", "#/page");
    			add_location(a5, file, 35, 5, 1045);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file, 34, 4, 1018);
    			attr_dev(a6, "class", "nav-link");
    			attr_dev(a6, "href", "#/provision");
    			add_location(a6, file, 38, 5, 1136);
    			attr_dev(li5, "class", "nav-item");
    			add_location(li5, file, 37, 4, 1109);
    			attr_dev(a7, "class", "nav-link");
    			attr_dev(a7, "href", "#/navigation");
    			add_location(a7, file, 41, 5, 1232);
    			attr_dev(li6, "class", "nav-item");
    			add_location(li6, file, 40, 4, 1205);
    			attr_dev(ul, "class", "navbar-nav");
    			add_location(ul, file, 21, 3, 622);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarNavDropdown");
    			add_location(div0, file, 20, 2, 557);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file, 7, 1, 193);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light bg-light");
    			add_location(nav, file, 6, 0, 132);
    			attr_dev(div2, "class", "container mt-3");
    			add_location(div2, file, 48, 0, 1333);
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
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, a4);
    			append_dev(ul, t10);
    			append_dev(ul, li4);
    			append_dev(li4, a5);
    			append_dev(ul, t12);
    			append_dev(ul, li5);
    			append_dev(li5, a6);
    			append_dev(ul, t14);
    			append_dev(ul, li6);
    			append_dev(li6, a7);
    			insert_dev(target, t16, anchor);
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
    			if (detaching) detach_dev(t16);
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
