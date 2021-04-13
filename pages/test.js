import React from 'react';
import { Link} from '@shopify/polaris';
import {Redirect} from '@shopify/app-bridge/actions';

const url = process.env.SHOPIFY_APP_URL

 const Test =() => {
    console.log(url)
    return (
  <Link external onClick={()=>{redirect.dispatch(Redirect.Action.APP, '/settings');}} >
    Index
  </Link>
    );
}


export default Test