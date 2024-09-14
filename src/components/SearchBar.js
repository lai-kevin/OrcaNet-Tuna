import { FaSearch } from "react-icons/fa";
const SearchBar = () => {
    return(
        <div id="searchbox">
        <form id="search">
         <div id="searchWrapper">
          <label htmlFor="searchInput">
            <input type="search" placeholder="Browse..." id="searchInput"></input>
          </label>
          <button type="submit" id="searchButton">
                <FaSearch />
          </button>
          </div>
        </form>
        </div>
        );
};
  
export default SearchBar;