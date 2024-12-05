import React from 'react';
import  './css/switch-toggle.css';

const Switch = ({idToggle, isToggled, onToggle}) => {
    return(
        <label className="menu-item switch">
            <input id={idToggle} type="checkbox" name="checkbox" checked={isToggled} onChange={onToggle}/>
            <span className="slider rounded" />
        </label>
    )
}

export default Switch;