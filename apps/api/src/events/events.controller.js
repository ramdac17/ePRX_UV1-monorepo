var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, Post, NotFoundException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // ADDED
import { diskStorage } from 'multer';
import { extname, join } from 'path';
let EventsController = (() => {
    let _classDecorators = [Controller(['events', 'event'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    var EventsController = _classThis = class {
        constructor(eventsService) {
            this.eventsService = (__runInitializers(this, _instanceExtraInitializers), eventsService);
        }
        // FIXED: The @Post route now has a function attached to it
        async create(file, body) {
            // Now 'file' will have a 'filename' property!
            // console.log('NEW_UPLOAD_LOG: File saved as ->', file?.filename);
            return this.eventsService.createEvent({
                ...body,
                image: file ? file.filename : null, // This will no longer be null
            });
        }
        async findAll() {
            const events = await this.eventsService.getEvents();
            if (!events)
                return [];
            return events;
        }
        async findOne(id) {
            const event = await this.eventsService.getEventById(id);
            if (!event)
                throw new NotFoundException(`EVENT_WITH_ID_${id}_NOT_FOUND`);
            return event;
        }
    };
    __setFunctionName(_classThis, "EventsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), UseInterceptors(FileInterceptor('image', {
                storage: diskStorage({
                    // This ensures the file is physically saved in the uploads folder
                    destination: join(process.cwd(), 'uploads'),
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
            }))];
        _findAll_decorators = [Get()];
        _findOne_decorators = [Get(':id')];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EventsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EventsController = _classThis;
})();
export { EventsController };
