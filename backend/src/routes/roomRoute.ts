import { BaseRoute } from "../abstract/BaseRoute";
import { BaseController } from "../abstract/BaseController";
import { Room } from "../interfaces/room";

export class RoomRoute extends BaseRoute<Room> {

    constructor(controller: BaseController<Room>) {
        super('/rooms', controller);
    }

    protected setRoutes(): void {
        
    }
}