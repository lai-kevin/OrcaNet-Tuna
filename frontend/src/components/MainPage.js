import { Outlet, NavLink } from "react-router-dom";
import NavBar from "./NavBar";
import SearchBar from "./SearchBar";
import { DropMenu } from "./SearchBar";
const MainPage = ()=> {
    return (
        <div className="base">
        <NavBar />  
        <div className="content">
          <SearchBar/>
          <main className="main_content">
            <Outlet/>  
          </main>
        </div>
      </div>
    )
}
export default MainPage;