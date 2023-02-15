import { createContext } from "react";
//this export from to hooks
export const UserContext = createContext({
    currentUser: {}
});


//this export from to class
export default UserContext;
