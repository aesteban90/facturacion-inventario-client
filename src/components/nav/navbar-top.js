import { useContext } from 'react';
import { NavbarTop, NavbarTopItem } from './navbar.component';
import { faUser, faArrowRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../UserContext';
import moment from 'moment';

const NavbarTopMenu = (props) =>{
    const currentUser = useContext(UserContext).currentUser;
    return(
        <div>
            <NavbarTop>
                <NavbarTopItem icon={faUser} id="account"  ><p className='mb-0'><b>{currentUser.name} </b>  logueado en {moment(currentUser.fecha).format("DD/MM/YYYY")}</p></NavbarTopItem>
                <NavbarTopItem icon={faArrowRightFromBracket} id="closesession" > Cerrar Session</NavbarTopItem>
            </NavbarTop>            
        </div>
    )
}

export { NavbarTopMenu }
