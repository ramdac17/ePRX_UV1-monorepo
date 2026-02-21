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
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { Controller, Post, UseGuards, UseInterceptors, BadRequestException, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import 'multer';
let AuthController = (() => {
    let _classDecorators = [Controller('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _login_decorators;
    let _getProfile_decorators;
    let _uploadAvatar_decorators;
    var AuthController = _classThis = class {
        constructor(authService) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
        }
        async login(loginDto) {
            console.log('--- [ePRX_UV1] LOGIN_ATTEMPT ---');
            try {
                const result = await this.authService.login(loginDto);
                console.log(`--- [ePRX_UV1] SUCCESS: ${loginDto.email} ---`);
                return result;
            }
            catch (error) {
                console.error('--- [ePRX_UV1] FAILURE ---', error.message);
                throw error;
            }
        }
        // ... (register, verify-email, forgot-password remain the same) ...
        async getProfile(req) {
            // CRITICAL FIX: Don't just return req.user (it's only JWT data).
            // Use the service to fetch the LATEST data from the DB, including the image!
            // Note: Use 'userId' or 'sub' or 'id' depending on your JwtStrategy (usually sub or id)
            const userId = req.user.id || req.user.sub;
            return this.authService.getProfile(userId);
        }
        async uploadAvatar(file, req) {
            if (!file) {
                throw new BadRequestException('No file provided or invalid file type.');
            }
            const filePath = `/uploads/avatars/${file.filename}`;
            const userId = req.user.id || req.user.sub; // Ensure we match the strategy key
            try {
                await this.authService.updateUserImage(userId, filePath);
                return {
                    success: true,
                    message: 'IDENTITY_IMAGE_SYNCED',
                    url: filePath
                };
            }
            catch (error) {
                console.error('--- [ePRX_UV1] DB_UPDATE_FAILED ---', error);
                throw new BadRequestException('Failed to update user profile image in database.');
            }
        }
    };
    __setFunctionName(_classThis, "AuthController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _login_decorators = [Post('login'), HttpCode(HttpStatus.OK)];
        _getProfile_decorators = [UseGuards(JwtAuthGuard), Get('profile')];
        _uploadAvatar_decorators = [Post('upload-avatar'), UseGuards(JwtAuthGuard), UseInterceptors(FileInterceptor('file', {
                storage: diskStorage({
                    destination: './uploads/avatars',
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                        return cb(new BadRequestException('Only image files (jpg, jpeg, png) are allowed!'), false);
                    }
                    cb(null, true);
                },
            }))];
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadAvatar_decorators, { kind: "method", name: "uploadAvatar", static: false, private: false, access: { has: obj => "uploadAvatar" in obj, get: obj => obj.uploadAvatar }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
})();
export { AuthController };
