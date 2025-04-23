// variables
const API_URL = "https://www.cinecolab.be/api";
const ITEMS_PER_PAGE = 10;

// base categories query
const categoriesQuery = `query allCategories {
  entries(section: "resourcesCategories", orderBy: "title ASC", relatedToEntries: [{section: "resources"}]) {
    id,
    title
  }
}`;

// base resources query
const resourcesQuery = `query resources($offset: Int, $limit: Int, $catsIds: [QueryArgument], $searchQuery: String) {
  totalResources: entryCount(section: "resources"),
  totalCount: entryCount(section: "resources", relatedTo: $catsIds, search: $searchQuery),
  entries(section: "resources", offset: $offset, limit: $limit, relatedTo: $catsIds, search: $searchQuery) {
    id
    title
    ... on resources_Entry {
      commonSummary
      commonUrl
      resourceType {
        id
        title
      }
      resourceCategories {
        id
        title
      }
    }
  }
}`;

/**
 * Alpine APP
 */

export default () => ({
  // variables
  resources: [],
  categories: [],
  checkedCategoriesIds: [],
  searchQuery: "",
  totalResources: 0,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  loading: true,

  // get all categories (called on init)
  async getCategories() {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: categoriesQuery,
        }),
      });

      // HTTP status error
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      // convert to json
      const responseJson = await response.json();

      // assign vars
      this.categories = responseJson.data.entries;
    } catch (error) {
      throw new Error(`Fetch ${error}`);
    }
  },

  // get resources
  // - provides params to GraphQL query
  // - called via x-effect so restarts everytime a variable it uses changes
  async getResources() {
    try {
      // get response
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: resourcesQuery,
          variables: {
            offset: (this.currentPage - 1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
            catsIds: this.checkedCategoriesIds,
            searchQuery: this.searchQuery,
          },
        }),
      });

      // HTTP status error
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      // convert to json
      const responseJson = await response.json();

      // assign vars
      this.resources = responseJson.data.entries;
      this.totalCount = responseJson.data.totalCount;
      this.totalResources = responseJson.data.totalResources;
      this.totalPages = Math.ceil(responseJson.data.total / ITEMS_PER_PAGE);
    } catch (error) {
      throw new Error(`Fetch ${error}`);
    }
  },
  prevPage() {
    this.currentPage--;
  },
  nextPage() {
    this.currentPage++;
  },
  init() {
    this.getCategories();
    this.getResources();
  },
});
