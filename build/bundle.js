
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity$1 = x => x;
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity$1, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    const subscriber_queue = [];
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

    const lightboxContent = writable(null);

    function isArrayLike(input) {
        return input.length !== undefined;
    }
    function loadSingleImage(image) {
        var promise = new Promise(function (resolve, reject) {
            if (image.naturalWidth) {
                // If the browser can determine the naturalWidth the image is already loaded successfully
                resolve(image);
            }
            else if (image.complete) {
                // If the image is complete but the naturalWidth is 0px it is probably broken
                reject(image);
            }
            else {
                image.addEventListener('load', fulfill);
                image.addEventListener('error', fulfill);
            }
            function fulfill() {
                if (image.naturalWidth) {
                    resolve(image);
                }
                else {
                    reject(image);
                }
                image.removeEventListener('load', fulfill);
                image.removeEventListener('error', fulfill);
            }
        });
        return Object.assign(promise, { image: image });
    }
    function loadImages(input, attributes) {
        if (attributes === void 0) { attributes = {}; }
        if (input instanceof HTMLImageElement) {
            return loadSingleImage(input);
        }
        if (typeof input === 'string') {
            /* Create a <img> from a string */
            var src = input;
            var image_1 = new Image();
            Object.keys(attributes).forEach(function (name) { return image_1.setAttribute(name, attributes[name]); });
            image_1.src = src;
            return loadSingleImage(image_1);
        }
        if (isArrayLike(input)) {
            // Momentarily ignore errors
            var reflect = function (img) { return loadImages(img, attributes).catch(function (error) { return error; }); };
            var reflected = [].map.call(input, reflect);
            var tsFix_1 = Promise.all(reflected).then(function (results) {
                var loaded = results.filter(function (x) { return x.naturalWidth; });
                if (loaded.length === results.length) {
                    return loaded;
                }
                return Promise.reject({
                    loaded: loaded,
                    errored: results.filter(function (x) { return !x.naturalWidth; })
                });
            });
            // Variables named `tsFix` are only here because TypeScript hates Promise-returning functions.
            return tsFix_1;
        }
        var tsFix = Promise.reject(new TypeError('input is not an image, a URL string, or an array of them.'));
        return tsFix;
    }

    /*! @license is-dom-node v1.0.4

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */
    function isDomNode(x) {
    	return typeof window.Node === 'object'
    		? x instanceof window.Node
    		: x !== null &&
    				typeof x === 'object' &&
    				typeof x.nodeType === 'number' &&
    				typeof x.nodeName === 'string'
    }

    /*! @license is-dom-node-list v1.2.1

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */

    function isDomNodeList(x) {
    	var prototypeToString = Object.prototype.toString.call(x);
    	var regex = /^\[object (HTMLCollection|NodeList|Object)\]$/;

    	return typeof window.NodeList === 'object'
    		? x instanceof window.NodeList
    		: x !== null &&
    				typeof x === 'object' &&
    				typeof x.length === 'number' &&
    				regex.test(prototypeToString) &&
    				(x.length === 0 || isDomNode(x[0]))
    }

    /*! @license Tealight v0.3.6

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */

    function tealight(target, context) {
      if ( context === void 0 ) context = document;

      if (target instanceof Array) { return target.filter(isDomNode); }
      if (isDomNode(target)) { return [target]; }
      if (isDomNodeList(target)) { return Array.prototype.slice.call(target); }
      if (typeof target === "string") {
        try {
          var query = context.querySelectorAll(target);
          return Array.prototype.slice.call(query);
        } catch (err) {
          return [];
        }
      }
      return [];
    }

    /*! @license Rematrix v0.3.0

    	Copyright 2018 Julian Lloyd.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in
    	all copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    	THE SOFTWARE.
    */
    /**
     * @module Rematrix
     */

    /**
     * Transformation matrices in the browser come in two flavors:
     *
     *  - `matrix` using 6 values (short)
     *  - `matrix3d` using 16 values (long)
     *
     * This utility follows this [conversion guide](https://goo.gl/EJlUQ1)
     * to expand short form matrices to their equivalent long form.
     *
     * @param  {array} source - Accepts both short and long form matrices.
     * @return {array}
     */
    function format(source) {
    	if (source.constructor !== Array) {
    		throw new TypeError('Expected array.')
    	}
    	if (source.length === 16) {
    		return source
    	}
    	if (source.length === 6) {
    		var matrix = identity();
    		matrix[0] = source[0];
    		matrix[1] = source[1];
    		matrix[4] = source[2];
    		matrix[5] = source[3];
    		matrix[12] = source[4];
    		matrix[13] = source[5];
    		return matrix
    	}
    	throw new RangeError('Expected array with either 6 or 16 values.')
    }

    /**
     * Returns a matrix representing no transformation. The product of any matrix
     * multiplied by the identity matrix will be the original matrix.
     *
     * > **Tip:** Similar to how `5 * 1 === 5`, where `1` is the identity.
     *
     * @return {array}
     */
    function identity() {
    	var matrix = [];
    	for (var i = 0; i < 16; i++) {
    		i % 5 == 0 ? matrix.push(1) : matrix.push(0);
    	}
    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing the combined transformations
     * of both arguments.
     *
     * > **Note:** Order is very important. For example, rotating 45°
     * along the Z-axis, followed by translating 500 pixels along the
     * Y-axis... is not the same as translating 500 pixels along the
     * Y-axis, followed by rotating 45° along on the Z-axis.
     *
     * @param  {array} m - Accepts both short and long form matrices.
     * @param  {array} x - Accepts both short and long form matrices.
     * @return {array}
     */
    function multiply(m, x) {
    	var fm = format(m);
    	var fx = format(x);
    	var product = [];

    	for (var i = 0; i < 4; i++) {
    		var row = [fm[i], fm[i + 4], fm[i + 8], fm[i + 12]];
    		for (var j = 0; j < 4; j++) {
    			var k = j * 4;
    			var col = [fx[k], fx[k + 1], fx[k + 2], fx[k + 3]];
    			var result =
    				row[0] * col[0] + row[1] * col[1] + row[2] * col[2] + row[3] * col[3];

    			product[i + k] = result;
    		}
    	}

    	return product
    }

    /**
     * Attempts to return a 4x4 matrix describing the CSS transform
     * matrix passed in, but will return the identity matrix as a
     * fallback.
     *
     * > **Tip:** This method is used to convert a CSS matrix (retrieved as a
     * `string` from computed styles) to its equivalent array format.
     *
     * @param  {string} source - `matrix` or `matrix3d` CSS Transform value.
     * @return {array}
     */
    function parse(source) {
    	if (typeof source === 'string') {
    		var match = source.match(/matrix(3d)?\(([^)]+)\)/);
    		if (match) {
    			var raw = match[2].split(', ').map(parseFloat);
    			return format(raw)
    		}
    	}
    	return identity()
    }

    /**
     * Returns a 4x4 matrix describing X-axis rotation.
     *
     * @param  {number} angle - Measured in degrees.
     * @return {array}
     */
    function rotateX(angle) {
    	var theta = Math.PI / 180 * angle;
    	var matrix = identity();

    	matrix[5] = matrix[10] = Math.cos(theta);
    	matrix[6] = matrix[9] = Math.sin(theta);
    	matrix[9] *= -1;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing Y-axis rotation.
     *
     * @param  {number} angle - Measured in degrees.
     * @return {array}
     */
    function rotateY(angle) {
    	var theta = Math.PI / 180 * angle;
    	var matrix = identity();

    	matrix[0] = matrix[10] = Math.cos(theta);
    	matrix[2] = matrix[8] = Math.sin(theta);
    	matrix[2] *= -1;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing Z-axis rotation.
     *
     * @param  {number} angle - Measured in degrees.
     * @return {array}
     */
    function rotateZ(angle) {
    	var theta = Math.PI / 180 * angle;
    	var matrix = identity();

    	matrix[0] = matrix[5] = Math.cos(theta);
    	matrix[1] = matrix[4] = Math.sin(theta);
    	matrix[4] *= -1;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing 2D scaling. The first argument
     * is used for both X and Y-axis scaling, unless an optional
     * second argument is provided to explicitly define Y-axis scaling.
     *
     * @param  {number} scalar    - Decimal multiplier.
     * @param  {number} [scalarY] - Decimal multiplier.
     * @return {array}
     */
    function scale(scalar, scalarY) {
    	var matrix = identity();

    	matrix[0] = scalar;
    	matrix[5] = typeof scalarY === 'number' ? scalarY : scalar;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing X-axis translation.
     *
     * @param  {number} distance - Measured in pixels.
     * @return {array}
     */
    function translateX(distance) {
    	var matrix = identity();
    	matrix[12] = distance;
    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing Y-axis translation.
     *
     * @param  {number} distance - Measured in pixels.
     * @return {array}
     */
    function translateY(distance) {
    	var matrix = identity();
    	matrix[13] = distance;
    	return matrix
    }

    /*! @license miniraf v1.0.0

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */
    var polyfill$1 = (function () {
    	var clock = Date.now();

    	return function (callback) {
    		var currentTime = Date.now();
    		if (currentTime - clock > 16) {
    			clock = currentTime;
    			callback(currentTime);
    		} else {
    			setTimeout(function () { return polyfill$1(callback); }, 0);
    		}
    	}
    })();

    var index = window.requestAnimationFrame ||
    	window.webkitRequestAnimationFrame ||
    	window.mozRequestAnimationFrame ||
    	polyfill$1;

    /*! @license ScrollReveal v4.0.9

    	Copyright 2021 Fisssion LLC.

    	Licensed under the GNU General Public License 3.0 for
    	compatible open source projects and non-commercial use.

    	For commercial sites, themes, projects, and applications,
    	keep your source code private/proprietary by purchasing
    	a commercial license from https://scrollrevealjs.org/
    */

    var defaults = {
    	delay: 0,
    	distance: '0',
    	duration: 600,
    	easing: 'cubic-bezier(0.5, 0, 0, 1)',
    	interval: 0,
    	opacity: 0,
    	origin: 'bottom',
    	rotate: {
    		x: 0,
    		y: 0,
    		z: 0
    	},
    	scale: 1,
    	cleanup: false,
    	container: document.documentElement,
    	desktop: true,
    	mobile: true,
    	reset: false,
    	useDelay: 'always',
    	viewFactor: 0.0,
    	viewOffset: {
    		top: 0,
    		right: 0,
    		bottom: 0,
    		left: 0
    	},
    	afterReset: function afterReset() {},
    	afterReveal: function afterReveal() {},
    	beforeReset: function beforeReset() {},
    	beforeReveal: function beforeReveal() {}
    };

    function failure() {
    	document.documentElement.classList.remove('sr');

    	return {
    		clean: function clean() {},
    		destroy: function destroy() {},
    		reveal: function reveal() {},
    		sync: function sync() {},
    		get noop() {
    			return true
    		}
    	}
    }

    function success() {
    	document.documentElement.classList.add('sr');

    	if (document.body) {
    		document.body.style.height = '100%';
    	} else {
    		document.addEventListener('DOMContentLoaded', function () {
    			document.body.style.height = '100%';
    		});
    	}
    }

    var mount = { success: success, failure: failure };

    function isObject(x) {
    	return (
    		x !== null &&
    		x instanceof Object &&
    		(x.constructor === Object ||
    			Object.prototype.toString.call(x) === '[object Object]')
    	)
    }

    function each(collection, callback) {
    	if (isObject(collection)) {
    		var keys = Object.keys(collection);
    		return keys.forEach(function (key) { return callback(collection[key], key, collection); })
    	}
    	if (collection instanceof Array) {
    		return collection.forEach(function (item, i) { return callback(item, i, collection); })
    	}
    	throw new TypeError('Expected either an array or object literal.')
    }

    function logger(message) {
    	var details = [], len = arguments.length - 1;
    	while ( len-- > 0 ) details[ len ] = arguments[ len + 1 ];

    	if (this.constructor.debug && console) {
    		var report = "%cScrollReveal: " + message;
    		details.forEach(function (detail) { return (report += "\n — " + detail); });
    		console.log(report, 'color: #ea654b;'); // eslint-disable-line no-console
    	}
    }

    function rinse() {
    	var this$1 = this;

    	var struct = function () { return ({
    		active: [],
    		stale: []
    	}); };

    	var elementIds = struct();
    	var sequenceIds = struct();
    	var containerIds = struct();

    	/**
    	 * Take stock of active element IDs.
    	 */
    	try {
    		each(tealight('[data-sr-id]'), function (node) {
    			var id = parseInt(node.getAttribute('data-sr-id'));
    			elementIds.active.push(id);
    		});
    	} catch (e) {
    		throw e
    	}
    	/**
    	 * Destroy stale elements.
    	 */
    	each(this.store.elements, function (element) {
    		if (elementIds.active.indexOf(element.id) === -1) {
    			elementIds.stale.push(element.id);
    		}
    	});

    	each(elementIds.stale, function (staleId) { return delete this$1.store.elements[staleId]; });

    	/**
    	 * Take stock of active container and sequence IDs.
    	 */
    	each(this.store.elements, function (element) {
    		if (containerIds.active.indexOf(element.containerId) === -1) {
    			containerIds.active.push(element.containerId);
    		}
    		if (element.hasOwnProperty('sequence')) {
    			if (sequenceIds.active.indexOf(element.sequence.id) === -1) {
    				sequenceIds.active.push(element.sequence.id);
    			}
    		}
    	});

    	/**
    	 * Destroy stale containers.
    	 */
    	each(this.store.containers, function (container) {
    		if (containerIds.active.indexOf(container.id) === -1) {
    			containerIds.stale.push(container.id);
    		}
    	});

    	each(containerIds.stale, function (staleId) {
    		var stale = this$1.store.containers[staleId].node;
    		stale.removeEventListener('scroll', this$1.delegate);
    		stale.removeEventListener('resize', this$1.delegate);
    		delete this$1.store.containers[staleId];
    	});

    	/**
    	 * Destroy stale sequences.
    	 */
    	each(this.store.sequences, function (sequence) {
    		if (sequenceIds.active.indexOf(sequence.id) === -1) {
    			sequenceIds.stale.push(sequence.id);
    		}
    	});

    	each(sequenceIds.stale, function (staleId) { return delete this$1.store.sequences[staleId]; });
    }

    var getPrefixedCssProp = (function () {
    	var properties = {};
    	var style = document.documentElement.style;

    	function getPrefixedCssProperty(name, source) {
    		if ( source === void 0 ) source = style;

    		if (name && typeof name === 'string') {
    			if (properties[name]) {
    				return properties[name]
    			}
    			if (typeof source[name] === 'string') {
    				return (properties[name] = name)
    			}
    			if (typeof source[("-webkit-" + name)] === 'string') {
    				return (properties[name] = "-webkit-" + name)
    			}
    			throw new RangeError(("Unable to find \"" + name + "\" style property."))
    		}
    		throw new TypeError('Expected a string.')
    	}

    	getPrefixedCssProperty.clearCache = function () { return (properties = {}); };

    	return getPrefixedCssProperty
    })();

    function style(element) {
    	var computed = window.getComputedStyle(element.node);
    	var position = computed.position;
    	var config = element.config;

    	/**
    	 * Generate inline styles
    	 */
    	var inline = {};
    	var inlineStyle = element.node.getAttribute('style') || '';
    	var inlineMatch = inlineStyle.match(/[\w-]+\s*:\s*[^;]+\s*/gi) || [];

    	inline.computed = inlineMatch ? inlineMatch.map(function (m) { return m.trim(); }).join('; ') + ';' : '';

    	inline.generated = inlineMatch.some(function (m) { return m.match(/visibility\s?:\s?visible/i); })
    		? inline.computed
    		: inlineMatch.concat( ['visibility: visible']).map(function (m) { return m.trim(); }).join('; ') + ';';

    	/**
    	 * Generate opacity styles
    	 */
    	var computedOpacity = parseFloat(computed.opacity);
    	var configOpacity = !isNaN(parseFloat(config.opacity))
    		? parseFloat(config.opacity)
    		: parseFloat(computed.opacity);

    	var opacity = {
    		computed: computedOpacity !== configOpacity ? ("opacity: " + computedOpacity + ";") : '',
    		generated: computedOpacity !== configOpacity ? ("opacity: " + configOpacity + ";") : ''
    	};

    	/**
    	 * Generate transformation styles
    	 */
    	var transformations = [];

    	if (parseFloat(config.distance)) {
    		var axis = config.origin === 'top' || config.origin === 'bottom' ? 'Y' : 'X';

    		/**
    		 * Let’s make sure our our pixel distances are negative for top and left.
    		 * e.g. { origin: 'top', distance: '25px' } starts at `top: -25px` in CSS.
    		 */
    		var distance = config.distance;
    		if (config.origin === 'top' || config.origin === 'left') {
    			distance = /^-/.test(distance) ? distance.substr(1) : ("-" + distance);
    		}

    		var ref = distance.match(/(^-?\d+\.?\d?)|(em$|px$|%$)/g);
    		var value = ref[0];
    		var unit = ref[1];

    		switch (unit) {
    			case 'em':
    				distance = parseInt(computed.fontSize) * value;
    				break
    			case 'px':
    				distance = value;
    				break
    			case '%':
    				/**
    				 * Here we use `getBoundingClientRect` instead of
    				 * the existing data attached to `element.geometry`
    				 * because only the former includes any transformations
    				 * current applied to the element.
    				 *
    				 * If that behavior ends up being unintuitive, this
    				 * logic could instead utilize `element.geometry.height`
    				 * and `element.geoemetry.width` for the distance calculation
    				 */
    				distance =
    					axis === 'Y'
    						? (element.node.getBoundingClientRect().height * value) / 100
    						: (element.node.getBoundingClientRect().width * value) / 100;
    				break
    			default:
    				throw new RangeError('Unrecognized or missing distance unit.')
    		}

    		if (axis === 'Y') {
    			transformations.push(translateY(distance));
    		} else {
    			transformations.push(translateX(distance));
    		}
    	}

    	if (config.rotate.x) { transformations.push(rotateX(config.rotate.x)); }
    	if (config.rotate.y) { transformations.push(rotateY(config.rotate.y)); }
    	if (config.rotate.z) { transformations.push(rotateZ(config.rotate.z)); }
    	if (config.scale !== 1) {
    		if (config.scale === 0) {
    			/**
    			 * The CSS Transforms matrix interpolation specification
    			 * basically disallows transitions of non-invertible
    			 * matrixes, which means browsers won't transition
    			 * elements with zero scale.
    			 *
    			 * That’s inconvenient for the API and developer
    			 * experience, so we simply nudge their value
    			 * slightly above zero; this allows browsers
    			 * to transition our element as expected.
    			 *
    			 * `0.0002` was the smallest number
    			 * that performed across browsers.
    			 */
    			transformations.push(scale(0.0002));
    		} else {
    			transformations.push(scale(config.scale));
    		}
    	}

    	var transform = {};
    	if (transformations.length) {
    		transform.property = getPrefixedCssProp('transform');
    		/**
    		 * The default computed transform value should be one of:
    		 * undefined || 'none' || 'matrix()' || 'matrix3d()'
    		 */
    		transform.computed = {
    			raw: computed[transform.property],
    			matrix: parse(computed[transform.property])
    		};

    		transformations.unshift(transform.computed.matrix);
    		var product = transformations.reduce(multiply);

    		transform.generated = {
    			initial: ((transform.property) + ": matrix3d(" + (product.join(', ')) + ");"),
    			final: ((transform.property) + ": matrix3d(" + (transform.computed.matrix.join(', ')) + ");")
    		};
    	} else {
    		transform.generated = {
    			initial: '',
    			final: ''
    		};
    	}

    	/**
    	 * Generate transition styles
    	 */
    	var transition = {};
    	if (opacity.generated || transform.generated.initial) {
    		transition.property = getPrefixedCssProp('transition');
    		transition.computed = computed[transition.property];
    		transition.fragments = [];

    		var delay = config.delay;
    		var duration = config.duration;
    		var easing = config.easing;

    		if (opacity.generated) {
    			transition.fragments.push({
    				delayed: ("opacity " + (duration / 1000) + "s " + easing + " " + (delay / 1000) + "s"),
    				instant: ("opacity " + (duration / 1000) + "s " + easing + " 0s")
    			});
    		}

    		if (transform.generated.initial) {
    			transition.fragments.push({
    				delayed: ((transform.property) + " " + (duration / 1000) + "s " + easing + " " + (delay / 1000) + "s"),
    				instant: ((transform.property) + " " + (duration / 1000) + "s " + easing + " 0s")
    			});
    		}

    		/**
    		 * The default computed transition property should be undefined, or one of:
    		 * '' || 'none 0s ease 0s' || 'all 0s ease 0s' || 'all 0s 0s cubic-bezier()'
    		 */
    		var hasCustomTransition =
    			transition.computed && !transition.computed.match(/all 0s|none 0s/);

    		if (hasCustomTransition) {
    			transition.fragments.unshift({
    				delayed: transition.computed,
    				instant: transition.computed
    			});
    		}

    		var composed = transition.fragments.reduce(
    			function (composition, fragment, i) {
    				composition.delayed += i === 0 ? fragment.delayed : (", " + (fragment.delayed));
    				composition.instant += i === 0 ? fragment.instant : (", " + (fragment.instant));
    				return composition
    			},
    			{
    				delayed: '',
    				instant: ''
    			}
    		);

    		transition.generated = {
    			delayed: ((transition.property) + ": " + (composed.delayed) + ";"),
    			instant: ((transition.property) + ": " + (composed.instant) + ";")
    		};
    	} else {
    		transition.generated = {
    			delayed: '',
    			instant: ''
    		};
    	}

    	return {
    		inline: inline,
    		opacity: opacity,
    		position: position,
    		transform: transform,
    		transition: transition
    	}
    }

    /**
     * apply a CSS string to an element using the CSSOM (element.style) rather
     * than setAttribute, which may violate the content security policy.
     *
     * @param {Node}   [el]  Element to receive styles.
     * @param {string} [declaration] Styles to apply.
     */
    function applyStyle (el, declaration) {
    	declaration.split(';').forEach(function (pair) {
    		var ref = pair.split(':');
    		var property = ref[0];
    		var value = ref.slice(1);
    		if (property && value) {
    			el.style[property.trim()] = value.join(':');
    		}
    	});
    }

    function clean(target) {
    	var this$1 = this;

    	var dirty;
    	try {
    		each(tealight(target), function (node) {
    			var id = node.getAttribute('data-sr-id');
    			if (id !== null) {
    				dirty = true;
    				var element = this$1.store.elements[id];
    				if (element.callbackTimer) {
    					window.clearTimeout(element.callbackTimer.clock);
    				}
    				applyStyle(element.node, element.styles.inline.generated);
    				node.removeAttribute('data-sr-id');
    				delete this$1.store.elements[id];
    			}
    		});
    	} catch (e) {
    		return logger.call(this, 'Clean failed.', e.message)
    	}

    	if (dirty) {
    		try {
    			rinse.call(this);
    		} catch (e) {
    			return logger.call(this, 'Clean failed.', e.message)
    		}
    	}
    }

    function destroy() {
    	var this$1 = this;

    	/**
    	 * Remove all generated styles and element ids
    	 */
    	each(this.store.elements, function (element) {
    		applyStyle(element.node, element.styles.inline.generated);
    		element.node.removeAttribute('data-sr-id');
    	});

    	/**
    	 * Remove all event listeners.
    	 */
    	each(this.store.containers, function (container) {
    		var target =
    			container.node === document.documentElement ? window : container.node;
    		target.removeEventListener('scroll', this$1.delegate);
    		target.removeEventListener('resize', this$1.delegate);
    	});

    	/**
    	 * Clear all data from the store
    	 */
    	this.store = {
    		containers: {},
    		elements: {},
    		history: [],
    		sequences: {}
    	};
    }

    function deepAssign(target) {
    	var sources = [], len = arguments.length - 1;
    	while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    	if (isObject(target)) {
    		each(sources, function (source) {
    			each(source, function (data, key) {
    				if (isObject(data)) {
    					if (!target[key] || !isObject(target[key])) {
    						target[key] = {};
    					}
    					deepAssign(target[key], data);
    				} else {
    					target[key] = data;
    				}
    			});
    		});
    		return target
    	} else {
    		throw new TypeError('Target must be an object literal.')
    	}
    }

    function isMobile(agent) {
    	if ( agent === void 0 ) agent = navigator.userAgent;

    	return /Android|iPhone|iPad|iPod/i.test(agent)
    }

    var nextUniqueId = (function () {
    	var uid = 0;
    	return function () { return uid++; }
    })();

    function initialize() {
    	var this$1 = this;

    	rinse.call(this);

    	each(this.store.elements, function (element) {
    		var styles = [element.styles.inline.generated];

    		if (element.visible) {
    			styles.push(element.styles.opacity.computed);
    			styles.push(element.styles.transform.generated.final);
    			element.revealed = true;
    		} else {
    			styles.push(element.styles.opacity.generated);
    			styles.push(element.styles.transform.generated.initial);
    			element.revealed = false;
    		}

    		applyStyle(element.node, styles.filter(function (s) { return s !== ''; }).join(' '));
    	});

    	each(this.store.containers, function (container) {
    		var target =
    			container.node === document.documentElement ? window : container.node;
    		target.addEventListener('scroll', this$1.delegate);
    		target.addEventListener('resize', this$1.delegate);
    	});

    	/**
    	 * Manually invoke delegate once to capture
    	 * element and container dimensions, container
    	 * scroll position, and trigger any valid reveals
    	 */
    	this.delegate();

    	/**
    	 * Wipe any existing `setTimeout` now
    	 * that initialization has completed.
    	 */
    	this.initTimeout = null;
    }

    function animate(element, force) {
    	if ( force === void 0 ) force = {};

    	var pristine = force.pristine || this.pristine;
    	var delayed =
    		element.config.useDelay === 'always' ||
    		(element.config.useDelay === 'onload' && pristine) ||
    		(element.config.useDelay === 'once' && !element.seen);

    	var shouldReveal = element.visible && !element.revealed;
    	var shouldReset = !element.visible && element.revealed && element.config.reset;

    	if (force.reveal || shouldReveal) {
    		return triggerReveal.call(this, element, delayed)
    	}

    	if (force.reset || shouldReset) {
    		return triggerReset.call(this, element)
    	}
    }

    function triggerReveal(element, delayed) {
    	var styles = [
    		element.styles.inline.generated,
    		element.styles.opacity.computed,
    		element.styles.transform.generated.final
    	];
    	if (delayed) {
    		styles.push(element.styles.transition.generated.delayed);
    	} else {
    		styles.push(element.styles.transition.generated.instant);
    	}
    	element.revealed = element.seen = true;
    	applyStyle(element.node, styles.filter(function (s) { return s !== ''; }).join(' '));
    	registerCallbacks.call(this, element, delayed);
    }

    function triggerReset(element) {
    	var styles = [
    		element.styles.inline.generated,
    		element.styles.opacity.generated,
    		element.styles.transform.generated.initial,
    		element.styles.transition.generated.instant
    	];
    	element.revealed = false;
    	applyStyle(element.node, styles.filter(function (s) { return s !== ''; }).join(' '));
    	registerCallbacks.call(this, element);
    }

    function registerCallbacks(element, isDelayed) {
    	var this$1 = this;

    	var duration = isDelayed
    		? element.config.duration + element.config.delay
    		: element.config.duration;

    	var beforeCallback = element.revealed
    		? element.config.beforeReveal
    		: element.config.beforeReset;

    	var afterCallback = element.revealed
    		? element.config.afterReveal
    		: element.config.afterReset;

    	var elapsed = 0;
    	if (element.callbackTimer) {
    		elapsed = Date.now() - element.callbackTimer.start;
    		window.clearTimeout(element.callbackTimer.clock);
    	}

    	beforeCallback(element.node);

    	element.callbackTimer = {
    		start: Date.now(),
    		clock: window.setTimeout(function () {
    			afterCallback(element.node);
    			element.callbackTimer = null;
    			if (element.revealed && !element.config.reset && element.config.cleanup) {
    				clean.call(this$1, element.node);
    			}
    		}, duration - elapsed)
    	};
    }

    function sequence(element, pristine) {
    	if ( pristine === void 0 ) pristine = this.pristine;

    	/**
    	 * We first check if the element should reset.
    	 */
    	if (!element.visible && element.revealed && element.config.reset) {
    		return animate.call(this, element, { reset: true })
    	}

    	var seq = this.store.sequences[element.sequence.id];
    	var i = element.sequence.index;

    	if (seq) {
    		var visible = new SequenceModel(seq, 'visible', this.store);
    		var revealed = new SequenceModel(seq, 'revealed', this.store);

    		seq.models = { visible: visible, revealed: revealed };

    		/**
    		 * If the sequence has no revealed members,
    		 * then we reveal the first visible element
    		 * within that sequence.
    		 *
    		 * The sequence then cues a recursive call
    		 * in both directions.
    		 */
    		if (!revealed.body.length) {
    			var nextId = seq.members[visible.body[0]];
    			var nextElement = this.store.elements[nextId];

    			if (nextElement) {
    				cue.call(this, seq, visible.body[0], -1, pristine);
    				cue.call(this, seq, visible.body[0], +1, pristine);
    				return animate.call(this, nextElement, { reveal: true, pristine: pristine })
    			}
    		}

    		/**
    		 * If our element isn’t resetting, we check the
    		 * element sequence index against the head, and
    		 * then the foot of the sequence.
    		 */
    		if (
    			!seq.blocked.head &&
    			i === [].concat( revealed.head ).pop() &&
    			i >= [].concat( visible.body ).shift()
    		) {
    			cue.call(this, seq, i, -1, pristine);
    			return animate.call(this, element, { reveal: true, pristine: pristine })
    		}

    		if (
    			!seq.blocked.foot &&
    			i === [].concat( revealed.foot ).shift() &&
    			i <= [].concat( visible.body ).pop()
    		) {
    			cue.call(this, seq, i, +1, pristine);
    			return animate.call(this, element, { reveal: true, pristine: pristine })
    		}
    	}
    }

    function Sequence(interval) {
    	var i = Math.abs(interval);
    	if (!isNaN(i)) {
    		this.id = nextUniqueId();
    		this.interval = Math.max(i, 16);
    		this.members = [];
    		this.models = {};
    		this.blocked = {
    			head: false,
    			foot: false
    		};
    	} else {
    		throw new RangeError('Invalid sequence interval.')
    	}
    }

    function SequenceModel(seq, prop, store) {
    	var this$1 = this;

    	this.head = [];
    	this.body = [];
    	this.foot = [];

    	each(seq.members, function (id, index) {
    		var element = store.elements[id];
    		if (element && element[prop]) {
    			this$1.body.push(index);
    		}
    	});

    	if (this.body.length) {
    		each(seq.members, function (id, index) {
    			var element = store.elements[id];
    			if (element && !element[prop]) {
    				if (index < this$1.body[0]) {
    					this$1.head.push(index);
    				} else {
    					this$1.foot.push(index);
    				}
    			}
    		});
    	}
    }

    function cue(seq, i, direction, pristine) {
    	var this$1 = this;

    	var blocked = ['head', null, 'foot'][1 + direction];
    	var nextId = seq.members[i + direction];
    	var nextElement = this.store.elements[nextId];

    	seq.blocked[blocked] = true;

    	setTimeout(function () {
    		seq.blocked[blocked] = false;
    		if (nextElement) {
    			sequence.call(this$1, nextElement, pristine);
    		}
    	}, seq.interval);
    }

    function reveal(target, options, syncing) {
    	var this$1 = this;
    	if ( options === void 0 ) options = {};
    	if ( syncing === void 0 ) syncing = false;

    	var containerBuffer = [];
    	var sequence$$1;
    	var interval = options.interval || defaults.interval;

    	try {
    		if (interval) {
    			sequence$$1 = new Sequence(interval);
    		}

    		var nodes = tealight(target);
    		if (!nodes.length) {
    			throw new Error('Invalid reveal target.')
    		}

    		var elements = nodes.reduce(function (elementBuffer, elementNode) {
    			var element = {};
    			var existingId = elementNode.getAttribute('data-sr-id');

    			if (existingId) {
    				deepAssign(element, this$1.store.elements[existingId]);

    				/**
    				 * In order to prevent previously generated styles
    				 * from throwing off the new styles, the style tag
    				 * has to be reverted to its pre-reveal state.
    				 */
    				applyStyle(element.node, element.styles.inline.computed);
    			} else {
    				element.id = nextUniqueId();
    				element.node = elementNode;
    				element.seen = false;
    				element.revealed = false;
    				element.visible = false;
    			}

    			var config = deepAssign({}, element.config || this$1.defaults, options);

    			if ((!config.mobile && isMobile()) || (!config.desktop && !isMobile())) {
    				if (existingId) {
    					clean.call(this$1, element);
    				}
    				return elementBuffer // skip elements that are disabled
    			}

    			var containerNode = tealight(config.container)[0];
    			if (!containerNode) {
    				throw new Error('Invalid container.')
    			}
    			if (!containerNode.contains(elementNode)) {
    				return elementBuffer // skip elements found outside the container
    			}

    			var containerId;
    			{
    				containerId = getContainerId(
    					containerNode,
    					containerBuffer,
    					this$1.store.containers
    				);
    				if (containerId === null) {
    					containerId = nextUniqueId();
    					containerBuffer.push({ id: containerId, node: containerNode });
    				}
    			}

    			element.config = config;
    			element.containerId = containerId;
    			element.styles = style(element);

    			if (sequence$$1) {
    				element.sequence = {
    					id: sequence$$1.id,
    					index: sequence$$1.members.length
    				};
    				sequence$$1.members.push(element.id);
    			}

    			elementBuffer.push(element);
    			return elementBuffer
    		}, []);

    		/**
    		 * Modifying the DOM via setAttribute needs to be handled
    		 * separately from reading computed styles in the map above
    		 * for the browser to batch DOM changes (limiting reflows)
    		 */
    		each(elements, function (element) {
    			this$1.store.elements[element.id] = element;
    			element.node.setAttribute('data-sr-id', element.id);
    		});
    	} catch (e) {
    		return logger.call(this, 'Reveal failed.', e.message)
    	}

    	/**
    	 * Now that element set-up is complete...
    	 * Let’s commit any container and sequence data we have to the store.
    	 */
    	each(containerBuffer, function (container) {
    		this$1.store.containers[container.id] = {
    			id: container.id,
    			node: container.node
    		};
    	});
    	if (sequence$$1) {
    		this.store.sequences[sequence$$1.id] = sequence$$1;
    	}

    	/**
    	 * If reveal wasn't invoked by sync, we want to
    	 * make sure to add this call to the history.
    	 */
    	if (syncing !== true) {
    		this.store.history.push({ target: target, options: options });

    		/**
    		 * Push initialization to the event queue, giving
    		 * multiple reveal calls time to be interpreted.
    		 */
    		if (this.initTimeout) {
    			window.clearTimeout(this.initTimeout);
    		}
    		this.initTimeout = window.setTimeout(initialize.bind(this), 0);
    	}
    }

    function getContainerId(node) {
    	var collections = [], len = arguments.length - 1;
    	while ( len-- > 0 ) collections[ len ] = arguments[ len + 1 ];

    	var id = null;
    	each(collections, function (collection) {
    		each(collection, function (container) {
    			if (id === null && container.node === node) {
    				id = container.id;
    			}
    		});
    	});
    	return id
    }

    /**
     * Re-runs the reveal method for each record stored in history,
     * for capturing new content asynchronously loaded into the DOM.
     */
    function sync() {
    	var this$1 = this;

    	each(this.store.history, function (record) {
    		reveal.call(this$1, record.target, record.options, true);
    	});

    	initialize.call(this);
    }

    var polyfill = function (x) { return (x > 0) - (x < 0) || +x; };
    var mathSign = Math.sign || polyfill;

    function getGeometry(target, isContainer) {
    	/**
    	 * We want to ignore padding and scrollbars for container elements.
    	 * More information here: https://goo.gl/vOZpbz
    	 */
    	var height = isContainer ? target.node.clientHeight : target.node.offsetHeight;
    	var width = isContainer ? target.node.clientWidth : target.node.offsetWidth;

    	var offsetTop = 0;
    	var offsetLeft = 0;
    	var node = target.node;

    	do {
    		if (!isNaN(node.offsetTop)) {
    			offsetTop += node.offsetTop;
    		}
    		if (!isNaN(node.offsetLeft)) {
    			offsetLeft += node.offsetLeft;
    		}
    		node = node.offsetParent;
    	} while (node)

    	return {
    		bounds: {
    			top: offsetTop,
    			right: offsetLeft + width,
    			bottom: offsetTop + height,
    			left: offsetLeft
    		},
    		height: height,
    		width: width
    	}
    }

    function getScrolled(container) {
    	var top, left;
    	if (container.node === document.documentElement) {
    		top = window.pageYOffset;
    		left = window.pageXOffset;
    	} else {
    		top = container.node.scrollTop;
    		left = container.node.scrollLeft;
    	}
    	return { top: top, left: left }
    }

    function isElementVisible(element) {
    	if ( element === void 0 ) element = {};

    	var container = this.store.containers[element.containerId];
    	if (!container) { return }

    	var viewFactor = Math.max(0, Math.min(1, element.config.viewFactor));
    	var viewOffset = element.config.viewOffset;

    	var elementBounds = {
    		top: element.geometry.bounds.top + element.geometry.height * viewFactor,
    		right: element.geometry.bounds.right - element.geometry.width * viewFactor,
    		bottom: element.geometry.bounds.bottom - element.geometry.height * viewFactor,
    		left: element.geometry.bounds.left + element.geometry.width * viewFactor
    	};

    	var containerBounds = {
    		top: container.geometry.bounds.top + container.scroll.top + viewOffset.top,
    		right: container.geometry.bounds.right + container.scroll.left - viewOffset.right,
    		bottom:
    			container.geometry.bounds.bottom + container.scroll.top - viewOffset.bottom,
    		left: container.geometry.bounds.left + container.scroll.left + viewOffset.left
    	};

    	return (
    		(elementBounds.top < containerBounds.bottom &&
    			elementBounds.right > containerBounds.left &&
    			elementBounds.bottom > containerBounds.top &&
    			elementBounds.left < containerBounds.right) ||
    		element.styles.position === 'fixed'
    	)
    }

    function delegate(
    	event,
    	elements
    ) {
    	var this$1 = this;
    	if ( event === void 0 ) event = { type: 'init' };
    	if ( elements === void 0 ) elements = this.store.elements;

    	index(function () {
    		var stale = event.type === 'init' || event.type === 'resize';

    		each(this$1.store.containers, function (container) {
    			if (stale) {
    				container.geometry = getGeometry.call(this$1, container, true);
    			}
    			var scroll = getScrolled.call(this$1, container);
    			if (container.scroll) {
    				container.direction = {
    					x: mathSign(scroll.left - container.scroll.left),
    					y: mathSign(scroll.top - container.scroll.top)
    				};
    			}
    			container.scroll = scroll;
    		});

    		/**
    		 * Due to how the sequencer is implemented, it’s
    		 * important that we update the state of all
    		 * elements, before any animation logic is
    		 * evaluated (in the second loop below).
    		 */
    		each(elements, function (element) {
    			if (stale || element.geometry === undefined) {
    				element.geometry = getGeometry.call(this$1, element);
    			}
    			element.visible = isElementVisible.call(this$1, element);
    		});

    		each(elements, function (element) {
    			if (element.sequence) {
    				sequence.call(this$1, element);
    			} else {
    				animate.call(this$1, element);
    			}
    		});

    		this$1.pristine = false;
    	});
    }

    function isTransformSupported() {
    	var style = document.documentElement.style;
    	return 'transform' in style || 'WebkitTransform' in style
    }

    function isTransitionSupported() {
    	var style = document.documentElement.style;
    	return 'transition' in style || 'WebkitTransition' in style
    }

    var version = "4.0.9";

    var boundDelegate;
    var boundDestroy;
    var boundReveal;
    var boundClean;
    var boundSync;
    var config;
    var debug;
    var instance$c;

    function ScrollReveal(options) {
    	if ( options === void 0 ) options = {};

    	var invokedWithoutNew =
    		typeof this === 'undefined' ||
    		Object.getPrototypeOf(this) !== ScrollReveal.prototype;

    	if (invokedWithoutNew) {
    		return new ScrollReveal(options)
    	}

    	if (!ScrollReveal.isSupported()) {
    		logger.call(this, 'Instantiation failed.', 'This browser is not supported.');
    		return mount.failure()
    	}

    	var buffer;
    	try {
    		buffer = config
    			? deepAssign({}, config, options)
    			: deepAssign({}, defaults, options);
    	} catch (e) {
    		logger.call(this, 'Invalid configuration.', e.message);
    		return mount.failure()
    	}

    	try {
    		var container = tealight(buffer.container)[0];
    		if (!container) {
    			throw new Error('Invalid container.')
    		}
    	} catch (e) {
    		logger.call(this, e.message);
    		return mount.failure()
    	}

    	config = buffer;

    	if ((!config.mobile && isMobile()) || (!config.desktop && !isMobile())) {
    		logger.call(
    			this,
    			'This device is disabled.',
    			("desktop: " + (config.desktop)),
    			("mobile: " + (config.mobile))
    		);
    		return mount.failure()
    	}

    	mount.success();

    	this.store = {
    		containers: {},
    		elements: {},
    		history: [],
    		sequences: {}
    	};

    	this.pristine = true;

    	boundDelegate = boundDelegate || delegate.bind(this);
    	boundDestroy = boundDestroy || destroy.bind(this);
    	boundReveal = boundReveal || reveal.bind(this);
    	boundClean = boundClean || clean.bind(this);
    	boundSync = boundSync || sync.bind(this);

    	Object.defineProperty(this, 'delegate', { get: function () { return boundDelegate; } });
    	Object.defineProperty(this, 'destroy', { get: function () { return boundDestroy; } });
    	Object.defineProperty(this, 'reveal', { get: function () { return boundReveal; } });
    	Object.defineProperty(this, 'clean', { get: function () { return boundClean; } });
    	Object.defineProperty(this, 'sync', { get: function () { return boundSync; } });

    	Object.defineProperty(this, 'defaults', { get: function () { return config; } });
    	Object.defineProperty(this, 'version', { get: function () { return version; } });
    	Object.defineProperty(this, 'noop', { get: function () { return false; } });

    	return instance$c ? instance$c : (instance$c = this)
    }

    ScrollReveal.isSupported = function () { return isTransformSupported() && isTransitionSupported(); };

    Object.defineProperty(ScrollReveal, 'debug', {
    	get: function () { return debug || false; },
    	set: function (value) { return (debug = typeof value === 'boolean' ? value : debug); }
    });

    ScrollReveal();

    /* src/Tailwind.svelte generated by Svelte v3.37.0 */

    function create_fragment$b(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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
    	validate_slots("Tailwind", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwind> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwind",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    var data = {
    	hero : {
    		title: "KG Hall of Fame Series",
    		id: "hero",
    		video: "2gozUplZA6Q"
    	},
    	timeline:{
    		title: "Timeline",
    		id: "timeline",
    		events: [
    			{
    				date: "May 19, 1976",
    				name: "Born in Greenville, SC",
    				content: {
    					image: "",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "June 26, 1995",
    				name: "KG Declares for the NBA Draft",
    				content: {
    					image: "assets/tw21-kg_si.jpeg",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "June 28, 1995",
    				name: "The Draft",
    				content: {
    					image: "",
    					tweet: "<blockquote class='twitter-tweet'><p lang='en' dir='ltr'>𝐉𝐮𝐧𝐞 𝟐𝟖, 𝟏𝟗𝟗𝟓<br><br>The high school kid is the No. 5 pick... 🐺 <a href='https://t.co/X8RbZHP09W'>pic.twitter.com/X8RbZHP09W</a></p>&mdash; Minnesota Timberwolves (@Timberwolves) <a href='https://twitter.com/Timberwolves/status/1277241314254323717?ref_src=twsrc%5Etfw'>June 28, 2020</a></blockquote>",
    					video: "",
    				},
    			},
    			{
    				date: "October 30, 1995",
    				name: "Training Camp",
    				content: {
    					image: "",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "November 3, 1995",
    				name: "First Game",
    				content: {
    					image: "",
    					tweet: "<blockquote class='twitter-tweet'><p lang='en' dir='ltr'>𝟏𝟏/𝟎𝟑/𝟏𝟗𝟗𝟓:<br><br>The Big Ticket made his <a href='https://twitter.com/NBA?ref_src=twsrc%5Etfw'>@NBA</a> debut. 🐐 <a href='https://t.co/Tg41jUYxBZ'>pic.twitter.com/Tg41jUYxBZ</a></p>&mdash; Minnesota Timberwolves (@Timberwolves) <a href='https://twitter.com/Timberwolves/status/1323627352430055428?ref_src=twsrc%5Etfw'>November 3, 2020</a></blockquote>",
    					video: "",
    				},
    			},
    			{
    				date: "1997",
    				name: "Air Garnett I Drops",
    				content: {
    					image: "assets/tw21-kg_air.jpg",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "February 9, 1997",
    				name: "First All-Star Game",
    				content: {
    					image: "",
    					video: "GUiI9jwgJgU",
    					tweet: "",
    				},
    			},
    			{
    				date: "April 10, 1997",
    				name: "Clinched First Playoff Berth",
    				content: {
    					image : "assets/tw21-kg_playoffs.jpg",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "February 8, 1998",
    				name: "Oop from God to Kobe",
    				content: {
    					image: "",
    					video: "",
    					tweet: "<blockquote class='twitter-tweet'><p lang='en' dir='ltr'>&quot;I always call it &#39;The Alley-Oop from God.&#39;&quot; <br>-- KG to Kobe, All-Star &#39;98 <a href='https://t.co/2YXflPY3Ur'>pic.twitter.com/2YXflPY3Ur</a></p>&mdash; Minnesota Timberwolves (@Timberwolves) <a href='https://twitter.com/Timberwolves/status/1222975248364187648?ref_src=twsrc%5Etfw'>January 30, 2020</a></blockquote>",
    				},
    			},
    			{
    				date: "April 26, 1998",
    				name: "First Playoff Win",
    				content: {
    					image: "assets/tw21-kg_firstwin.jpg",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "October 1, 2000",
    				name: "Olympic Gold",
    				content: {
    					image : "assets/tw21-kg_olympics.jpg",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "February 9, 2003",
    				name: "All-Star MVP",
    				content: {
    					image: "",
    					video: "UPOaQdPKE6U",
    					tweet: "",
    				},
    			},
    			{
    				date: "May 4, 2004",
    				name: "Awarded MVP",
    				content: {
    					image : "assets/tw21-kg_mvp.jpg",
    					video: "ZeC_caH1AEA",
    					tweet: "",
    				},
    			},
    			{
    				date: "April 30, 2004",
    				name: "First Playoff Series Win",
    				content: {
    					image : "assets/tw21-kg_advance.jpg",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "May 19, 2004",
    				name: "Game 7 vs Sacramento",
    				content: {
    					image : "assets/tw21-kg_game7.jpg",
    					video: "03r6R4WF7t0",
    					tweet: "",
    				},
    			},
    			{
    				date: "July 30, 2007",
    				name: "Traded to Boston",
    				content: {
    					image: "",
    					video: "OR5SQ3mRObE",
    					tweet: "",
    				},
    			},
    			{
    				date: "June 16, 2008",
    				name: "Boston Wins Championship",
    				content: {
    					image : "assets/tw21-kg_championship.gif",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "July 12, 2013",
    				name: "Traded to Brooklyn",
    				content: {
    					image: "",
    					video: "ELF6mjKuf_A",
    					tweet: "",
    				},
    			},
    			{
    				date: "February 19, 2015",
    				name: "Traded back to Minnesota",
    				content: {
    					image: "assets/tw21-kg_return.jpg",
    					video: "D_eJuCfzPxM",
    					tweet: "",
    				},
    			},
    			{
    				date: "February 25, 2015",
    				name: "First Game Back",
    				content: {
    					image: "",
    					video: "uJxmdE2JLWc",
    					tweet: "",
    				},
    			},
    			{
    				date: "December 7, 2015",
    				name: "Dunk on Blake Griffin",
    				content: {
    					image: "",
    					video: "is1AXAEOKqw",
    					tweet: "",
    				},
    			},
    			{
    				date: "January 23, 2016",
    				name: "Final Game",
    				content: {
    					image: "",
    					video: "",
    					tweet: "",
    				},
    			},
    			{
    				date: "May 15, 2021",
    				name: "Hall of Fame Induction",
    				content: {
    					image: "",
    					video: "",
    					tweet: "",
    				},
    			},
    		],
    	},
    	ugc: {
    		title: "Share Your Message",
    		id: "ugc",
    		desc: "Upload your video with your message of congrats or your favorite KG memory!",
    		video: "mmN_IdO2wiU",
    		cta: {
    			title: "Upload Your Message",
    			link: "https://gf.fan/timberwolves/kg",
    		},
    	},
    	etw: {
    		title: "Enter to Win",
    		id: "etw",
    		desc: "Fill out the form for your chance to win the newest issue of SLAM Magazine featuring KG on the cover!",
    		image: "https://www.nba.com/resources/static/team/v2/timberwolves/KG-HoF-Slam-Cover-ETW-210513.jpg",
    		marketo: {
    			path: "//events.wolveslynx.com",
    			id: "1267",
    			token: "055-RNL-339",
    		},
    	}
    };

    /* src/components/Section.svelte generated by Svelte v3.37.0 */

    const file$a = "src/components/Section.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let div;
    	let section_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "container mx-auto relative");
    			add_location(div, file$a, 8, 1, 191);
    			attr_dev(section, "id", /*sectionId*/ ctx[1]);
    			attr_dev(section, "class", section_class_value = `relative mx-auto ${/*classList*/ ctx[0] || ""}`);
    			add_location(section, file$a, 7, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*sectionId*/ 2) {
    				attr_dev(section, "id", /*sectionId*/ ctx[1]);
    			}

    			if (!current || dirty & /*classList*/ 1 && section_class_value !== (section_class_value = `relative mx-auto ${/*classList*/ ctx[0] || ""}`)) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots("Section", slots, ['default']);
    	let { class: classList = "" } = $$props;
    	let { id: sectionId = "" } = $$props;
    	const writable_props = ["class", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, classList = $$props.class);
    		if ("id" in $$props) $$invalidate(1, sectionId = $$props.id);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classList, sectionId });

    	$$self.$inject_state = $$props => {
    		if ("classList" in $$props) $$invalidate(0, classList = $$props.classList);
    		if ("sectionId" in $$props) $$invalidate(1, sectionId = $$props.sectionId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [classList, sectionId, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { class: 0, id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity$1 } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/Loading.svelte generated by Svelte v3.37.0 */
    const file$9 = "src/components/Loading.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Loading");
    			t1 = text(/*ellipses*/ ctx[0]);
    			attr_dev(div, "class", "flex justify-center items-center fixed h-full w-full top-0 left-0 bg-black text-white uppercase z-20 uppercase text-2xl font-black");
    			add_location(div, file$9, 15, 0, 283);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*ellipses*/ 1) set_data_dev(t1, /*ellipses*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
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
    	validate_slots("Loading", slots, []);
    	let ellipses = ".";

    	const loader = setInterval(
    		() => {
    			if (ellipses.length < 3) {
    				$$invalidate(0, ellipses += ".");
    			} else {
    				$$invalidate(0, ellipses = ".");
    			}
    		},
    		500
    	);

    	onDestroy(() => clearInterval(loader));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onDestroy, fade, ellipses, loader });

    	$$self.$inject_state = $$props => {
    		if ("ellipses" in $$props) $$invalidate(0, ellipses = $$props.ellipses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ellipses];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Spotlight.svelte generated by Svelte v3.37.0 */
    const file$8 = "src/components/Spotlight.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (13:2) {#each layers as layer, i}
    function create_each_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = "" + (path + "tw21-kg_header_layer_opt_" + /*layer*/ ctx[3] + ".png"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parallax layer " + /*layer*/ ctx[3]);
    			attr_dev(img, "class", "svelte-f375i3");
    			add_location(img, file$8, 17, 4, 495);
    			set_style(div, "transform", "translate(0," + -/*y*/ ctx[0] * /*layer*/ ctx[3] / (/*layers*/ ctx[1].length - 1) + "px)");

    			attr_dev(div, "class", "" + (null_to_empty(`mx-auto lg:max-w-600px ${/*layer*/ ctx[3] === 4
			? "bg-gradient-to-t from-black via-black to-transparent"
			: ""}`) + " svelte-f375i3"));

    			add_location(div, file$8, 13, 3, 292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*y*/ 1) {
    				set_style(div, "transform", "translate(0," + -/*y*/ ctx[0] * /*layer*/ ctx[3] / (/*layers*/ ctx[1].length - 1) + "px)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(13:2) {#each layers as layer, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let section;
    	let div0;
    	let t0;
    	let div5;
    	let div1;
    	let span0;
    	let t2;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let span1;
    	let t4;
    	let svg;
    	let path_1;
    	let t5;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t7;
    	let div4;
    	let img3;
    	let img3_src_value;
    	let section_transition;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[2]);
    	let each_value = /*layers*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div5 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Presented By";
    			t2 = space();
    			img0 = element("img");
    			t3 = space();
    			span1 = element("span");
    			t4 = text("scroll down\n\t\t\t");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			t5 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t6 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t7 = space();
    			div4 = element("div");
    			img3 = element("img");
    			attr_dev(div0, "class", "parallax-container mx-auto svelte-f375i3");
    			add_location(div0, file$8, 11, 1, 219);
    			attr_dev(span0, "class", "text-xs uppercase top-1 relative font-bold svelte-f375i3");
    			add_location(span0, file$8, 26, 3, 968);
    			attr_dev(img0, "class", "w-full");
    			attr_dev(img0, "alt", "star tribune");
    			if (img0.src !== (img0_src_value = "assets/strib-logo.svg")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$8, 27, 3, 1048);
    			attr_dev(div1, "class", "absolute max-w-100px md:max-w-200px right-3 md:top-4 md:right-5 text-right text-white top-0");
    			add_location(div1, file$8, 25, 2, 859);
    			attr_dev(path_1, "d", "M19 14l-7 7m0 0l-7-7m7 7V3");
    			add_location(path_1, file$8, 32, 7, 1466);
    			attr_dev(svg, "class", "w-6 h-6 text-white mx-auto");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$8, 31, 3, 1300);
    			attr_dev(span1, "class", "absolute font-bold animate-pulse mt-5 text-white block uppercase font-medium text-center text-sm svelte-f375i3");
    			set_style(span1, "opacity", 1 - Math.max(0, /*y*/ ctx[0] / 40));
    			add_location(span1, file$8, 29, 2, 1127);
    			attr_dev(img1, "class", "invisible");
    			if (img1.src !== (img1_src_value = "assets/header-placeholder.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$8, 36, 3, 1575);
    			attr_dev(div2, "class", "mx-auto lg:max-w-600px");
    			add_location(div2, file$8, 35, 2, 1535);
    			attr_dev(img2, "class", "mx-auto lg:h-auto lg:w-1/2");
    			if (img2.src !== (img2_src_value = "assets/tw21-kg_header_layer_copy.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "parallax layer copy");
    			add_location(img2, file$8, 39, 3, 1742);
    			attr_dev(div3, "class", "absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent");
    			add_location(div3, file$8, 38, 2, 1650);
    			attr_dev(img3, "class", "w-full");
    			if (img3.src !== (img3_src_value = "assets/tw21-kg_header_layer_lighting.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "parallax layer lighting");
    			add_location(img3, file$8, 42, 3, 1926);
    			attr_dev(div4, "class", "absolute mix-blend-screen w-full top-0 left-0");
    			add_location(div4, file$8, 41, 2, 1863);
    			attr_dev(div5, "class", "text-container relative w-full text-center box-border pointer-events-none flex flex-col items-center justify-between border-b-8 border-green-800 bg-gradient-to-t from-black via-transparent to-transparent overflow-hidden");
    			add_location(div5, file$8, 24, 1, 623);
    			attr_dev(section, "class", "spotlight font-body");
    			add_location(section, file$8, 10, 0, 164);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, div5);
    			append_dev(div5, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t2);
    			append_dev(div1, img0);
    			append_dev(div5, t3);
    			append_dev(div5, span1);
    			append_dev(span1, t4);
    			append_dev(span1, svg);
    			append_dev(svg, path_1);
    			append_dev(div5, t5);
    			append_dev(div5, div2);
    			append_dev(div2, img1);
    			append_dev(div5, t6);
    			append_dev(div5, div3);
    			append_dev(div3, img2);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, img3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[2]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*y, layers, path*/ 3) {
    				each_value = /*layers*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*y*/ 1) {
    				set_style(span1, "opacity", 1 - Math.max(0, /*y*/ ctx[0] / 40));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, {}, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, {}, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (detaching && section_transition) section_transition.end();
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

    const path = "assets/";

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spotlight", slots, []);
    	const layers = [1, 2, 3, 4, 5];
    	let y;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spotlight> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, y = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({ fade, path, layers, y });

    	$$self.$inject_state = $$props => {
    		if ("y" in $$props) $$invalidate(0, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [y, layers, onwindowscroll];
    }

    class Spotlight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spotlight",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.37.0 */

    const file$7 = "src/components/Footer.svelte";

    function create_fragment$7(ctx) {
    	let footer;
    	let div;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let a1;
    	let t2;
    	let span;
    	let a2;
    	let svg0;
    	let path0;
    	let t3;
    	let a3;
    	let svg1;
    	let path1;
    	let t4;
    	let a4;
    	let svg2;
    	let rect;
    	let path2;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			a1 = element("a");
    			a1.textContent = "© 2021 Minnesota Timberwolves";
    			t2 = space();
    			span = element("span");
    			a2 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t3 = space();
    			a3 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t4 = space();
    			a4 = element("a");
    			svg2 = svg_element("svg");
    			rect = svg_element("rect");
    			path2 = svg_element("path");
    			attr_dev(img, "class", "w-full max-w-100px");
    			if (img.src !== (img_src_value = "https://cdn.nba.com/teams/static/timberwolves/images/logo/Wolves_Primary_Color.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Minnesota Timberwolves Footer Logo");
    			add_location(img, file$7, 3, 6, 244);
    			attr_dev(a0, "href", "https://www.nba.com/timberwolves");
    			attr_dev(a0, "class", "max-w-1/4");
    			add_location(a0, file$7, 2, 4, 176);
    			attr_dev(a1, "href", "https://www.nba.com/timberwolves");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "uppercase md:ml-2");
    			add_location(a1, file$7, 5, 4, 420);
    			attr_dev(path0, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path0, file$7, 9, 10, 867);
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "class", "w-5 h-5");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$7, 8, 8, 731);
    			attr_dev(a2, "href", "https://www.facebook.com/MNTimberwolves/");
    			add_location(a2, file$7, 7, 6, 671);
    			attr_dev(path1, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path1, file$7, 14, 10, 1181);
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "class", "w-5 h-5");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$7, 13, 8, 1045);
    			attr_dev(a3, "href", "https://twitter.com/Timberwolves");
    			attr_dev(a3, "class", "ml-3");
    			add_location(a3, file$7, 12, 6, 980);
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$7, 19, 10, 1617);
    			attr_dev(path2, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01");
    			add_location(path2, file$7, 20, 10, 1690);
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "class", "w-5 h-5");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$7, 18, 8, 1467);
    			attr_dev(a4, "href", "https://www.instagram.com/timberwolves/");
    			attr_dev(a4, "class", "ml-3");
    			add_location(a4, file$7, 17, 6, 1395);
    			attr_dev(span, "class", "inline-flex sm:ml-auto sm:mt-0 mt-4 items-center justify-center sm:justify-start");
    			add_location(span, file$7, 6, 4, 569);
    			attr_dev(div, "class", "container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col");
    			add_location(div, file$7, 1, 2, 91);
    			attr_dev(footer, "class", "bg-black text-white body-font relative border-t-8 border-green-800 z-10");
    			add_location(footer, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, a0);
    			append_dev(a0, img);
    			append_dev(div, t0);
    			append_dev(div, a1);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, a2);
    			append_dev(a2, svg0);
    			append_dev(svg0, path0);
    			append_dev(span, t3);
    			append_dev(span, a3);
    			append_dev(a3, svg1);
    			append_dev(svg1, path1);
    			append_dev(span, t4);
    			append_dev(span, a4);
    			append_dev(a4, svg2);
    			append_dev(svg2, rect);
    			append_dev(svg2, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/TimelineBar.svelte generated by Svelte v3.37.0 */

    const file$6 = "src/components/TimelineBar.svelte";

    function create_fragment$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "timeline h-full w-2 bg-green-800 absolute left-4 md:left-0 md:right-0 mx-auto");
    			add_location(div, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots("TimelineBar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimelineBar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TimelineBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimelineBar",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/YTEmbed.svelte generated by Svelte v3.37.0 */

    const file$5 = "src/components/YTEmbed.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "absolute inset-0 w-full h-full");
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/" + /*vid*/ ctx[0])) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "YouTube video player");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$5, 5, 1, 93);
    			attr_dev(div, "class", "relative");
    			set_style(div, "padding-top", "56.25%");
    			add_location(div, file$5, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*vid*/ 1 && iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/" + /*vid*/ ctx[0])) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
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
    	validate_slots("YTEmbed", slots, []);
    	let { vid = "" } = $$props;
    	const writable_props = ["vid"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<YTEmbed> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("vid" in $$props) $$invalidate(0, vid = $$props.vid);
    	};

    	$$self.$capture_state = () => ({ vid });

    	$$self.$inject_state = $$props => {
    		if ("vid" in $$props) $$invalidate(0, vid = $$props.vid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [vid];
    }

    class YTEmbed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { vid: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "YTEmbed",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get vid() {
    		throw new Error("<YTEmbed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vid(value) {
    		throw new Error("<YTEmbed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Event.svelte generated by Svelte v3.37.0 */
    const file$4 = "src/components/Event.svelte";

    // (23:2) {#if content.image}
    function create_if_block_2(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "w-full border-4 border-green-800");
    			if (img.src !== (img_src_value = /*content*/ ctx[6].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*name*/ ctx[5]);
    			add_location(img, file$4, 24, 64, 1136);
    			attr_dev(a, "href", /*content*/ ctx[6].image);
    			add_location(a, file$4, 24, 3, 1075);
    			attr_dev(div, "class", "first:mt-0 last:mb-0 my-5");
    			add_location(div, file$4, 23, 2, 1032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(23:2) {#if content.image}",
    		ctx
    	});

    	return block;
    }

    // (28:2) {#if content.video}
    function create_if_block_1$1(ctx) {
    	let div1;
    	let div0;
    	let ytembed;
    	let current;

    	ytembed = new YTEmbed({
    			props: { vid: /*content*/ ctx[6].video },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(ytembed.$$.fragment);
    			attr_dev(div0, "class", "border-4 border-green-800");
    			add_location(div0, file$4, 29, 3, 1304);
    			attr_dev(div1, "class", "first:mt-0 last:mb-0 my-5");
    			add_location(div1, file$4, 28, 2, 1261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(ytembed, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ytembed.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ytembed.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(ytembed);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(28:2) {#if content.video}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if content.tweet}
    function create_if_block$1(ctx) {
    	let div;
    	let raw_value = /*content*/ ctx[6].tweet + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "first:mt-0 last:mb-0 my-5");
    			add_location(div, file$4, 33, 2, 1421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(33:2) {#if content.tweet}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let t5;
    	let t6;
    	let div1_class_value;
    	let current;
    	let if_block0 = /*content*/ ctx[6].image && create_if_block_2(ctx);
    	let if_block1 = /*content*/ ctx[6].video && create_if_block_1$1(ctx);
    	let if_block2 = /*content*/ ctx[6].tweet && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = `${/*date*/ ctx[4]}`;
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = `${/*name*/ ctx[5]}`;
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", `bg-white border-4 border-green-800 h-6 md:absolute md:w-6 ml-2 md:ml-0 rounded-full w-7 ${/*even*/ ctx[2] ? "md:-right-3" : "md:-left-3"}`);
    			add_location(div0, file$4, 18, 1, 478);
    			attr_dev(p0, "class", "uppercase font-body tracking-wide mb-2 md:mb-3 md:text-xl");
    			add_location(p0, file$4, 20, 2, 834);
    			attr_dev(p1, "class", "text-xl md:text-3xl font-black tracking-wider uppercase mb-2 md:mb-4 ");
    			add_location(p1, file$4, 21, 2, 916);
    			attr_dev(div1, "class", div1_class_value = `relative text-center arrow left ${/*even*/ ctx[2] ? "md:right" : "md:left"} scroll-reveal invisible bg-white rounded-lg p-5 m-5 border-4 border-green-800 border-l-0 border-t-0 w-full event--${/*index*/ ctx[1]}`);
    			add_location(div1, file$4, 19, 1, 628);

    			attr_dev(div2, "class", `first:mt-5 last:mb-5 relative inline-flex items-center w-full md:w-1/2 ${/*even*/ ctx[2]
			? "md:self-start md:pr-4"
			: "md:self-end md:pl-4"}`);

    			add_location(div2, file$4, 17, 0, 332);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(div1, t4);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t5);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t6);
    			if (if_block2) if_block2.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*content*/ ctx[6].image) if_block0.p(ctx, dirty);
    			if (/*content*/ ctx[6].video) if_block1.p(ctx, dirty);
    			if (/*content*/ ctx[6].tweet) if_block2.p(ctx, dirty);

    			if (!current || dirty & /*index*/ 2 && div1_class_value !== (div1_class_value = `relative text-center arrow left ${/*even*/ ctx[2] ? "md:right" : "md:left"} scroll-reveal invisible bg-white rounded-lg p-5 m-5 border-4 border-green-800 border-l-0 border-t-0 w-full event--${/*index*/ ctx[1]}`)) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
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
    	validate_slots("Event", slots, []);
    	let { data = {} } = $$props;
    	let { index = 0 } = $$props;
    	let even = index % 2 === 0;

    	function handleImage(event, data) {
    		event.preventDefault();
    		lightboxContent.update(current => data);
    	}

    	let { date, name, content } = data;
    	const writable_props = ["data", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Event> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => handleImage(e, data);

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		YTEmbed,
    		data,
    		index,
    		even,
    		lightboxContent,
    		handleImage,
    		date,
    		name,
    		content
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("even" in $$props) $$invalidate(2, even = $$props.even);
    		if ("date" in $$props) $$invalidate(4, date = $$props.date);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("content" in $$props) $$invalidate(6, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, index, even, handleImage, date, name, content, click_handler];
    }

    class Event$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Event",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get data() {
    		throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Events.svelte generated by Svelte v3.37.0 */
    const file$3 = "src/components/Events.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (9:1) {#each events as event, i}
    function create_each_block(ctx) {
    	let event;
    	let current;

    	event = new Event$1({
    			props: {
    				data: /*event*/ ctx[1],
    				index: /*i*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(event.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(event, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const event_changes = {};
    			if (dirty & /*events*/ 1) event_changes.data = /*event*/ ctx[1];
    			event.$set(event_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(event.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(event.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(event, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:1) {#each events as event, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	let each_value = /*events*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "events flex flex-col");
    			add_location(div, file$3, 7, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*events*/ 1) {
    				each_value = /*events*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
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
    	validate_slots("Events", slots, []);
    	let { events = {} } = $$props;
    	const writable_props = ["events"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Events> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("events" in $$props) $$invalidate(0, events = $$props.events);
    	};

    	$$self.$capture_state = () => ({ onMount, Event: Event$1, events });

    	$$self.$inject_state = $$props => {
    		if ("events" in $$props) $$invalidate(0, events = $$props.events);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [events];
    }

    class Events extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { events: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Events",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get events() {
    		throw new Error("<Events>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set events(value) {
    		throw new Error("<Events>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Lightbox.svelte generated by Svelte v3.37.0 */
    const file$2 = "src/components/Lightbox.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let div1_class_value;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "+";
    			t1 = space();
    			img = element("img");
    			attr_dev(span, "class", "close-button leading-normal");
    			add_location(span, file$2, 38, 3, 1095);
    			attr_dev(div0, "class", "ml-auto text-black bg-white h-5 w-5 mb-2 flex justify-center items-center cursor-pointer rounded-full transform rotate-45");
    			add_location(div0, file$2, 37, 2, 956);
    			attr_dev(img, "id", "lightboxImage");
    			if (img.src !== (img_src_value = /*lightboxImage*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*lightboxImage*/ ctx[0].alt);
    			add_location(img, file$2, 40, 2, 1157);
    			attr_dev(div1, "class", div1_class_value = `p-5 ${/*portrait*/ ctx[1] ? "md:max-w-500px" : "md:max-w-2/3"}`);
    			add_location(div1, file$2, 36, 1, 886);
    			attr_dev(div2, "class", "flex flex-col justify-center items-center bg-black bg-opacity-50 fixed top-0 left-0 h-full w-full");
    			add_location(div2, file$2, 35, 0, 734);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handleKeydown*/ ctx[3], false, false, false),
    					listen_dev(div2, "click", /*handleClose*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*lightboxImage*/ 1 && img.src !== (img_src_value = /*lightboxImage*/ ctx[0].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*lightboxImage*/ 1 && img_alt_value !== (img_alt_value = /*lightboxImage*/ ctx[0].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (!current || dirty & /*portrait*/ 2 && div1_class_value !== (div1_class_value = `p-5 ${/*portrait*/ ctx[1] ? "md:max-w-500px" : "md:max-w-2/3"}`)) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			run_all(dispose);
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
    	let $lightboxContent;
    	validate_store(lightboxContent, "lightboxContent");
    	component_subscribe($$self, lightboxContent, $$value => $$invalidate(4, $lightboxContent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lightbox", slots, []);

    	function handleClose(event) {
    		event.target.tagName !== "IMG" && lightboxContent.set(null);
    	}

    	function handleKeydown(event) {
    		if (event.keyCode === 27) {
    			handleClose(event);
    		}
    	}

    	let lightboxImage = document.createElement("img");
    	lightboxImage.src = $lightboxContent.content.image;
    	lightboxImage.alt = $lightboxContent.name;
    	let portrait = false;

    	onMount(() => {
    		if (lightboxImage) {
    			$$invalidate(1, portrait = lightboxImage.width < lightboxImage.height
    			? true
    			: false);
    		}
    	});

    	onDestroy(() => {
    		lightboxImage.remove();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lightbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		lightboxContent,
    		fade,
    		handleClose,
    		handleKeydown,
    		lightboxImage,
    		portrait,
    		$lightboxContent
    	});

    	$$self.$inject_state = $$props => {
    		if ("lightboxImage" in $$props) $$invalidate(0, lightboxImage = $$props.lightboxImage);
    		if ("portrait" in $$props) $$invalidate(1, portrait = $$props.portrait);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lightboxImage, portrait, handleClose, handleKeydown];
    }

    class Lightbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lightbox",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Marketo.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/components/Marketo.svelte";

    function create_fragment$1(ctx) {
    	let script;
    	let script_src_value;
    	let t;
    	let form;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			script = element("script");
    			t = space();
    			form = element("form");
    			if (script.src !== (script_src_value = "" + (/*path*/ ctx[1] + "/js/forms2/js/forms2.min.js"))) attr_dev(script, "src", script_src_value);
    			add_location(script, file$1, 11, 1, 194);
    			attr_dev(form, "id", "mktoForm_" + /*id*/ ctx[0]);
    			add_location(form, file$1, 13, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script);
    			insert_dev(target, t, anchor);
    			insert_dev(target, form, anchor);

    			if (!mounted) {
    				dispose = listen_dev(script, "load", /*handleLoad*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(form);
    			mounted = false;
    			dispose();
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
    	validate_slots("Marketo", slots, []);
    	let { data = {} } = $$props;
    	let { id, path, token } = data;

    	function handleLoad() {
    		MktoForms2.loadForm(path, token, id);
    	}

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Marketo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		data,
    		id,
    		path,
    		token,
    		handleLoad
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("token" in $$props) token = $$props.token;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, path, handleLoad, data];
    }

    class Marketo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Marketo",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get data() {
    		throw new Error("<Marketo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Marketo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (68:1) <Section>
    function create_default_slot_2(ctx) {
    	let div;
    	let ytembed;
    	let current;

    	ytembed = new YTEmbed({
    			props: { vid: /*hero*/ ctx[2].video },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(ytembed.$$.fragment);
    			attr_dev(div, "class", "border-8 border-green-800 border-t-0 lg:max-w-2/3 md:mx-auto lg:rounded-b-xl");
    			add_location(div, file, 68, 2, 2138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(ytembed, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ytembed.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ytembed.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(ytembed);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(68:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (73:1) <Section id={timeline.id}>
    function create_default_slot_1(ctx) {
    	let timelinebar;
    	let t;
    	let events;
    	let current;
    	timelinebar = new TimelineBar({ $$inline: true });

    	events = new Events({
    			props: { events: /*timeline*/ ctx[3].events },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(timelinebar.$$.fragment);
    			t = space();
    			create_component(events.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinebar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(events, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinebar.$$.fragment, local);
    			transition_in(events.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinebar.$$.fragment, local);
    			transition_out(events.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinebar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(events, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(73:1) <Section id={timeline.id}>",
    		ctx
    	});

    	return block;
    }

    // (77:1) <Section id={ugc.id} class="text-black pb-10 border-b-8 border-green-800">
    function create_default_slot(ctx) {
    	let div1;
    	let ytembed;
    	let t0;
    	let div0;
    	let h2;
    	let t2;
    	let p;
    	let t4;
    	let a;
    	let t5_value = /*ugc*/ ctx[4].cta.title + "";
    	let t5;
    	let current;

    	ytembed = new YTEmbed({
    			props: { vid: /*ugc*/ ctx[4].video },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(ytembed.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*ugc*/ ctx[4].title}`;
    			t2 = space();
    			p = element("p");
    			p.textContent = `${/*ugc*/ ctx[4].desc}`;
    			t4 = space();
    			a = element("a");
    			t5 = text(t5_value);
    			attr_dev(h2, "class", "text-4xl font-bold uppercase mb-2");
    			add_location(h2, file, 80, 4, 2627);
    			attr_dev(p, "class", "text-xl tracking-wide mb-4");
    			add_location(p, file, 81, 4, 2694);
    			attr_dev(a, "class", "inline-block font-bold text-white p-5 bg-green-800 rounded-md uppercase hover:bg-green-700 transition-colors duration-300");
    			attr_dev(a, "href", /*ugc*/ ctx[4].cta.link);
    			attr_dev(a, "rel", "noreferrer noopener");
    			add_location(a, file, 82, 4, 2751);
    			attr_dev(div0, "class", "text-center mt-5");
    			add_location(div0, file, 79, 3, 2592);
    			attr_dev(div1, "class", "bg-white border-b-4 border-green-800 border-r-4 max-w-600px mx-2 md:mx-auto p-5 rounded-lg");
    			add_location(div1, file, 77, 2, 2454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(ytembed, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(div0, t4);
    			append_dev(div0, a);
    			append_dev(a, t5);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ytembed.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ytembed.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(ytembed);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(77:1) <Section id={ugc.id} class=\\\"text-black pb-10 border-b-8 border-green-800\\\">",
    		ctx
    	});

    	return block;
    }

    // (88:1) {#if loading}
    function create_if_block_1(ctx) {
    	let loading_1;
    	let current;
    	loading_1 = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(88:1) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (91:1) {#if $lightboxContent}
    function create_if_block(ctx) {
    	let lightbox;
    	let current;
    	lightbox = new Lightbox({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lightbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lightbox, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lightbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:1) {#if $lightboxContent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let tailwind;
    	let t0;
    	let nav;
    	let a;
    	let t2;
    	let spotlight;
    	let t3;
    	let main;
    	let section0;
    	let t4;
    	let section1;
    	let t5;
    	let section2;
    	let t6;
    	let t7;
    	let t8;
    	let footer;
    	let current;
    	tailwind = new Tailwind({ $$inline: true });
    	spotlight = new Spotlight({ $$inline: true });

    	section0 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				id: /*timeline*/ ctx[3].id,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				id: /*ugc*/ ctx[4].id,
    				class: "text-black pb-10 border-b-8 border-green-800",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*loading*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = /*$lightboxContent*/ ctx[1] && create_if_block(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tailwind.$$.fragment);
    			t0 = space();
    			nav = element("nav");
    			a = element("a");
    			a.textContent = "Enter Timberwolves.com";
    			t2 = space();
    			create_component(spotlight.$$.fragment);
    			t3 = space();
    			main = element("main");
    			create_component(section0.$$.fragment);
    			t4 = space();
    			create_component(section1.$$.fragment);
    			t5 = space();
    			create_component(section2.$$.fragment);
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			if (if_block1) if_block1.c();
    			t8 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(a, "href", "https://www.nba.com/timberwolves");
    			attr_dev(a, "class", "block bg-black text-center uppercase text-white py-2 hover:text-gray-300 font-bold transition-colors duration-200");
    			add_location(a, file, 63, 1, 1879);
    			add_location(nav, file, 62, 0, 1872);
    			attr_dev(main, "class", "relative font-body");
    			add_location(main, file, 66, 0, 2091);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwind, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a);
    			insert_dev(target, t2, anchor);
    			mount_component(spotlight, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(section0, main, null);
    			append_dev(main, t4);
    			mount_component(section1, main, null);
    			append_dev(main, t5);
    			mount_component(section2, main, null);
    			append_dev(main, t6);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t7);
    			if (if_block1) if_block1.m(main, null);
    			insert_dev(target, t8, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);

    			if (/*loading*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*loading*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t7);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$lightboxContent*/ ctx[1]) {
    				if (if_block1) {
    					if (dirty & /*$lightboxContent*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwind.$$.fragment, local);
    			transition_in(spotlight.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwind.$$.fragment, local);
    			transition_out(spotlight.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwind, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t2);
    			destroy_component(spotlight, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(section0);
    			destroy_component(section1);
    			destroy_component(section2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t8);
    			destroy_component(footer, detaching);
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
    	let $lightboxContent;
    	validate_store(lightboxContent, "lightboxContent");
    	component_subscribe($$self, lightboxContent, $$value => $$invalidate(1, $lightboxContent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { hero, timeline, ugc } = data;
    	let loading = true;

    	function handleRender() {
    		if (document.getElementsByClassName("twitter-tweet")) {
    			const script = document.createElement("script");
    			script.setAttribute("src", "https://platform.twitter.com/widgets.js");
    			script.setAttribute("onload", "twttr.events.bind('rendered',function(e) {window.dispatchEvent(new Event('resize'))});");
    			document.getElementsByClassName("twitter-tweet")[0].appendChild(script);
    		} else window.dispatchEvent(new Event("resize"));

    		$$invalidate(0, loading = false);
    	}

    	onMount(() => {
    		const images = document.querySelectorAll("img"); // or a NodeList
    		ScrollReveal({ scale: 0.9, duration: 1000 }).reveal(".scroll-reveal", { reset: true });

    		loadImages(images).then(function (allImgs) {
    			console.log(allImgs.length, "images loaded!", allImgs);
    			handleRender();
    		}).catch(function (err) {
    			console.error("One or more images have failed to load.");
    			console.error(err.errored);
    			console.info("But these loaded fine:");
    			console.info(err.loaded);
    			handleRender();
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		lightboxContent,
    		loadImage: loadImages,
    		ScrollReveal,
    		Tailwind,
    		data,
    		Section,
    		Loading,
    		Spotlight,
    		Footer,
    		TimelineBar,
    		Events,
    		YTEmbed,
    		Lightbox,
    		Marketo,
    		hero,
    		timeline,
    		ugc,
    		loading,
    		handleRender,
    		$lightboxContent
    	});

    	$$self.$inject_state = $$props => {
    		if ("hero" in $$props) $$invalidate(2, hero = $$props.hero);
    		if ("timeline" in $$props) $$invalidate(3, timeline = $$props.timeline);
    		if ("ugc" in $$props) $$invalidate(4, ugc = $$props.ugc);
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loading, $lightboxContent, hero, timeline, ugc];
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
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
