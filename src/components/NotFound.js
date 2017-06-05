import React from 'react';
import { Card, CardTitle } from 'material-ui/Card';

const NotFound = () => (
  <div className="row noResults">
    <div className="col col-sm-12">
      <Card>
        <CardTitle title="Sorry, the page you're looking for doesn't exist :/"/>
      </Card>
    </div>
  </div>
)

export default NotFound;
