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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, NotFoundException, ConflictException, } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
let UserService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UserService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async createUser(data) {
            try {
                console.log('📡 PRISMA_ATTEMPT_CREATE:', data.email);
                return await this.prisma.user.create({ data });
            }
            catch (error) {
                // 1. Log the full error to your NestJS terminal so you can see it!
                console.error('❌ PRISMA_CRITICAL_ERROR:', error);
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new ConflictException('A user with this email or username already exists.');
                    }
                }
                // If it's a 500 error, this throw passes the raw error back to the console
                throw error;
            }
        }
        async purgeAccount(id) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (user && user.image) {
                try {
                    const imagePath = join(process.cwd(), 'uploads', user.image);
                    await unlink(imagePath);
                }
                catch (err) {
                    console.error("IMAGE_DELETION_FAILED:", err);
                }
            }
            return await this.prisma.user.delete({ where: { id } });
        }
        // ... rest of your methods remain solid
        async findUserById(id) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new NotFoundException(`User with ID ${id} not found`);
            return user;
        }
        async findUserByEmail(email) {
            return this.prisma.user.findUnique({ where: { email } });
        }
        async updateProfile(userId, updateData, filePath) {
            const data = { ...updateData };
            if (filePath)
                data.image = filePath;
            return this.prisma.user.update({
                where: { id: userId },
                data,
            });
        }
    };
    __setFunctionName(_classThis, "UserService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserService = _classThis;
})();
export { UserService };
