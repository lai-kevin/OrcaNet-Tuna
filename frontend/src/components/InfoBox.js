import { useContext } from "react";
import { Mode } from "./Mode";
const InfoBox=({content})=>{
    const {mode} = useContext(Mode)
    return (
        <div className={`${mode === 'dark' ? 'info_box-dark' : 'info_box-light'}`}>
            {content}
        </div>
    )
}
export default InfoBox;