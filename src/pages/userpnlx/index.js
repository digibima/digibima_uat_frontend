
import React from 'react';
import Layout from './component/layout';
import {Sidebar,Claim,Pilicies,Profile} from './component/sidebar';
import Dashboard from './component/dashboard';

const userProfile = ({usersData}) => {
    return (
        <Layout>
            <div >
                <Dashboard usersData={{usersData}}/>
            </div>
        </Layout>
    );
};

export default userProfile;