/**
 * axios
 * 
 * @description Promise based HTTP client for the browser and node.js
 * @github https://github.com/axios/axios
 */
import Axios from 'axios';

declare global {
  var axios: typeof Axios;
}

axios = window.axios = Axios;

/**
 * Moment.js
 * 
 * @description Parse, validate, manipulate, and display dates and times
 * @github https://github.com/moment/moment
 */
import Moment from 'moment';

declare global {
  var moment: typeof Moment;
}

moment = window.moment = Moment;
moment.defaultFormat = "DD MMMM YYYY";

/**
 * query-string
 * 
 * @description Parse and stringify URL query strings
 * @github https://github.com/sindresorhus/query-string
 */
import QueryString from 'query-string';

declare global {
  var queryString: typeof QueryString;
}

queryString = window.queryString = QueryString;
