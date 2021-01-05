
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.28.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Footer.svelte generated by Svelte v3.28.0 */

    const file = "src/components/Footer.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let t1;
    	let div1;
    	let h2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "All photos can be downloaded and used for free on any purpose";
    			t1 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "© 2021 Kota Yatagai";
    			attr_dev(span, "class", "footer-license-words svelte-58sjbt");
    			add_location(span, file, 2, 4, 56);
    			attr_dev(div0, "class", "footer-license svelte-58sjbt");
    			add_location(div0, file, 1, 2, 23);
    			attr_dev(h2, "class", "svelte-58sjbt");
    			add_location(h2, file, 5, 4, 201);
    			attr_dev(div1, "class", "footer-name svelte-58sjbt");
    			add_location(div1, file, 4, 2, 171);
    			attr_dev(div2, "class", "footer svelte-58sjbt");
    			add_location(div2, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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

    function instance($$self, $$props) {
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
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Gallery.svelte generated by Svelte v3.28.0 */

    const file$1 = "src/components/Gallery.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].index;
    	child_ctx[2] = list[i].tags;
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (13:10) {#each tags as tag, i}
    function create_each_block_1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*tag*/ ctx[5] + "";
    	let t1;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("#");
    			t1 = text(t1_value);
    			attr_dev(span, "class", span_class_value = "tag " + /*tag*/ ctx[5] + " svelte-1qatwqs");
    			add_location(span, file$1, 12, 32, 407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultArray*/ 1 && t1_value !== (t1_value = /*tag*/ ctx[5] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*resultArray*/ 1 && span_class_value !== (span_class_value = "tag " + /*tag*/ ctx[5] + " svelte-1qatwqs")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(13:10) {#each tags as tag, i}",
    		ctx
    	});

    	return block;
    }

    // (5:2) {#each resultArray as { index, tags }
    function create_each_block(ctx) {
    	let div2;
    	let div1;
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;
    	let t0;
    	let div0;
    	let t1;
    	let each_value_1 = /*tags*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(img, "alt", "img");
    			if (img.src !== (img_src_value = "./img-pc/" + /*index*/ ctx[1] + ".jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1qatwqs");
    			add_location(img, file$1, 7, 77, 256);
    			attr_dev(a, "class", "data-img svelte-1qatwqs");
    			attr_dev(a, "href", a_href_value = "https://pics.kota-yata.com/img-pc/" + /*i*/ ctx[4] + ".jpg");
    			add_location(a, file$1, 7, 8, 187);
    			attr_dev(div0, "class", "tag-container svelte-1qatwqs");
    			add_location(div0, file$1, 11, 8, 347);
    			attr_dev(div1, "class", "for-tag svelte-1qatwqs");
    			add_location(div1, file$1, 6, 6, 157);
    			attr_dev(div2, "class", "photo svelte-1qatwqs");
    			add_location(div2, file$1, 5, 4, 131);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultArray*/ 1 && img.src !== (img_src_value = "./img-pc/" + /*index*/ ctx[1] + ".jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*resultArray*/ 1) {
    				each_value_1 = /*tags*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(5:2) {#each resultArray as { index, tags }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = /*resultArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "photo-container svelte-1qatwqs");
    			add_location(div, file$1, 3, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resultArray*/ 1) {
    				each_value = /*resultArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	let { resultArray } = $$props;
    	const writable_props = ["resultArray"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("resultArray" in $$props) $$invalidate(0, resultArray = $$props.resultArray);
    	};

    	$$self.$capture_state = () => ({ resultArray });

    	$$self.$inject_state = $$props => {
    		if ("resultArray" in $$props) $$invalidate(0, resultArray = $$props.resultArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resultArray];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { resultArray: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*resultArray*/ ctx[0] === undefined && !("resultArray" in props)) {
    			console.warn("<Gallery> was created without expected prop 'resultArray'");
    		}
    	}

    	get resultArray() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resultArray(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Data.svelte generated by Svelte v3.28.0 */

    const imageData = [
    	["la", "citadel", "parking"],
    	["la", "redondo", "beach"],
    	["la", "redondo", "pier"],
    	["la", "beverlyhills"],
    	["la", "originalfarmersmarket", "crowded"],
    	["mug", "mac"],
    	["la", "hollywood"],
    	["la", "redondo", "pier", "fishing"],
    	["la", "hollywood", "shopping"],
    	["la", "beverlyhills", "park"],
    	["la", "citadel", "starbucks"],
    	["la", "ucla"],
    	["la", "ucla"],
    	["la", "ucla"],
    	["la", "santamonica", "traffic"],
    	["la", "santamonica"],
    	["la", "santamonica"],
    	["la", "santamonica", "sea"],
    	["la", "carlsbad", "road"],
    	["la", "hollywood", "universalstudios"],
    	["la", "hollywood", "universalstudios"],
    	["la", "hollywood", "universalstudios"],
    	["la", "hollywood", "universalstudios"],
    	["la", "hollywood", "universalstudios"],
    	["keyboard", "hhkb"],
    	["microphone", "marantz"],
    	["la", "disneyland", "anaheim"],
    	["la", "redondo"],
    	["la", "hollywood"],
    	["la", "redondo", "beach"],
    	["la", "hollywood", "roosevelthotel"],
    	["la", "redondo", "beach"],
    	["la", "redondo", "pier"],
    	["la", "redondo", "tree"],
    	["la", "redondo", "bike"]
    ];

    const subjectArray = [];

    for (let i = 0; i < imageData.length; i++) {
    	subjectArray.push({ index: i, tags: imageData[i] });
    }

    /* src/App.svelte generated by Svelte v3.28.0 */
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div2;
    	let div0;
    	let a;
    	let h1;
    	let t1;
    	let div1;
    	let label;
    	let i;
    	let t2;
    	let input;
    	let t3;
    	let div3;
    	let gallery;
    	let t4;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;

    	gallery = new Gallery({
    			props: { resultArray: /*resultArray*/ ctx[1]() },
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			h1 = element("h1");
    			h1.textContent = "KOTA-YATA pics";
    			t1 = space();
    			div1 = element("div");
    			label = element("label");
    			i = element("i");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			div3 = element("div");
    			create_component(gallery.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "svelte-1iy2pti");
    			add_location(h1, file$2, 17, 38, 490);
    			attr_dev(a, "href", "https://kota-yata.com");
    			add_location(a, file$2, 17, 6, 458);
    			attr_dev(div0, "id", "logo");
    			add_location(div0, file$2, 16, 4, 436);
    			attr_dev(i, "class", "fas fa-search svelte-1iy2pti");
    			add_location(i, file$2, 21, 8, 602);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "hollywood");
    			attr_dev(input, "name", "search");
    			attr_dev(input, "id", "search");
    			attr_dev(input, "class", "svelte-1iy2pti");
    			add_location(input, file$2, 22, 8, 640);
    			attr_dev(label, "id", "search_box_contents");
    			attr_dev(label, "class", "svelte-1iy2pti");
    			add_location(label, file$2, 20, 6, 561);
    			attr_dev(div1, "id", "search_box");
    			attr_dev(div1, "class", "svelte-1iy2pti");
    			add_location(div1, file$2, 19, 4, 533);
    			attr_dev(div2, "id", "header");
    			attr_dev(div2, "class", "svelte-1iy2pti");
    			add_location(div2, file$2, 15, 2, 414);
    			attr_dev(div3, "id", "img_container");
    			attr_dev(div3, "class", "svelte-1iy2pti");
    			add_location(div3, file$2, 26, 2, 776);
    			attr_dev(main, "class", "svelte-1iy2pti");
    			add_location(main, file$2, 14, 0, 405);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			append_dev(a, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(label, i);
    			append_dev(label, t2);
    			append_dev(label, input);
    			set_input_value(input, /*searchWords*/ ctx[0]);
    			append_dev(main, t3);
    			append_dev(main, div3);
    			mount_component(gallery, div3, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchWords*/ 1 && input.value !== /*searchWords*/ ctx[0]) {
    				set_input_value(input, /*searchWords*/ ctx[0]);
    			}

    			const gallery_changes = {};
    			if (dirty & /*resultArray*/ 2) gallery_changes.resultArray = /*resultArray*/ ctx[1]();
    			gallery.$set(gallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(gallery);
    			destroy_component(footer);
    			mounted = false;
    			dispose();
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
    	validate_slots("App", slots, []);
    	let searchWords;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchWords = this.value;
    		$$invalidate(0, searchWords);
    	}

    	$$self.$capture_state = () => ({
    		Footer,
    		Gallery,
    		subjectArray,
    		searchWords,
    		resultArray
    	});

    	$$self.$inject_state = $$props => {
    		if ("searchWords" in $$props) $$invalidate(0, searchWords = $$props.searchWords);
    		if ("resultArray" in $$props) $$invalidate(1, resultArray = $$props.resultArray);
    	};

    	let resultArray;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchWords*/ 1) {
    			 $$invalidate(1, resultArray = () => {
    				if (searchWords === "ALL" || !searchWords) {
    					return subjectArray;
    				}

    				return subjectArray.filter(img => {
    					img.tags.includes(searchWords);
    				});
    			});
    		}
    	};

    	return [searchWords, resultArray, input_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
