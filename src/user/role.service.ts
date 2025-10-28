import { Inject } from "@nestjs/common";
import { RoleRepositoryInterface } from "./repositories/abstract/role.repository-interface";
import { RoleDocument, RoleEnum } from "./models/role.model";

export class RoleService {
    constructor(
        @Inject(RoleRepositoryInterface)
        private readonly roleRepository: RoleRepositoryInterface
    ) { }

    async getRoleById(id: string): Promise<RoleDocument> {
        return this.roleRepository.findById(id);
    }

    async getRoleByName(name: string): Promise<RoleDocument> {
        return this.roleRepository.findOne({ name });
    }

    async createRole(role: Partial<RoleDocument>): Promise<RoleDocument> {
        return this.roleRepository.create(role);
    }

    async updateRole(id: string, role: Partial<RoleDocument>): Promise<RoleDocument> {
        return this.roleRepository.update(id, role);
    }

    async getOrCreateRole(name: RoleEnum): Promise<RoleDocument> {
        const role = await this.getRoleByName(name);
        if (!role) {
            return this.createRole({ name });
        }
        return role;
    }
}

