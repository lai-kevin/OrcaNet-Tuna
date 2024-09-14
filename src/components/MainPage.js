import { Outlet, NavLink } from "react-router-dom";
import NavBar from "./NavBar";
import SearchBar from "./SearchBar";
const MainPage = ()=> {
    return (
        <div className= "base"> 
           <NavBar/>
           <SearchBar/>
           <main className="main_content">
                <Outlet /> 
            </main>
        </div>
    )
}
export default MainPage;