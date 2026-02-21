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
import { Controller, Post, Get, UseInterceptors, BadRequestException, Delete, UseGuards, UnauthorizedException, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// DTO for updating user profile
export class UpdateUserProfileDto {
}
// --- Controller ---
let UserController = (() => {
    let _classDecorators = [Controller('user')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _remove_decorators;
    let _getProfile_decorators;
    let _uploadFile_decorators;
    var UserController = _classThis = class {
        constructor(userService) {
            this.userService = (__runInitializers(this, _instanceExtraInitializers), userService);
        }
        /** DELETE: Remove user account (authenticated user only) */
        async remove(id, req) {
            const user = req.user;
            if (!user || user.id !== id) {
                throw new UnauthorizedException('PURGE_DENIED');
            }
            await this.userService.purgeAccount(id);
            return {
                status: 'PURGE_COMPLETE',
                message: 'ALL_DATA_ERASED_FROM_EPRX_UV1',
            };
        }
        /** GET: Fetch user profile by ID */
        async getProfile(id) {
            if (!id)
                throw new BadRequestException('User ID is required');
            const user = await this.userService.findUserById(id);
            return {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                image: user.image,
            };
        }
        /** POST: Upload user profile image */
        async uploadFile(id, file, body) {
            const imagePath = file?.filename;
            const updatedUser = await this.userService.updateProfile(id, body ?? {}, imagePath);
            return {
                message: 'PROFILE_SYNC_SUCCESSFUL',
                image: updatedUser.image,
                user: updatedUser,
            };
        }
    };
    __setFunctionName(_classThis, "UserController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _remove_decorators = [UseGuards(JwtAuthGuard), Delete(':id')];
        _getProfile_decorators = [Get('profile')];
        _uploadFile_decorators = [Post(':id/upload-image'), UseInterceptors(FileInterceptor('image', {
                storage: diskStorage({
                    destination: join(process.cwd(), 'uploads'),
                    filename: (_, file, callback) => {
                        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                        const ext = extname(file.originalname);
                        callback(null, `image-${uniqueSuffix}${ext}`);
                    },
                }),
                fileFilter: (_, file, callback) => {
                    if (!file.mimetype?.match(/\/(jpg|jpeg|png)$/)) {
                        return callback(new BadRequestException('Only image files are allowed!'), false);
                    }
                    callback(null, true);
                },
            }))];
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadFile_decorators, { kind: "method", name: "uploadFile", static: false, private: false, access: { has: obj => "uploadFile" in obj, get: obj => obj.uploadFile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserController = _classThis;
})();
export { UserController };
