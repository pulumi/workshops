import { RandomComponent } from "./randomComponent";

var myPassword = new RandomComponent("myPassword", { length: 24 })

export const password = myPassword.password;