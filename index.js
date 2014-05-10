/**
 * 
 * The Bipio Numerous Pod. 
 * 
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *  
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * @see http://docs.numerous.apiary.io
 */
var Pod = require('bip-pod'),
    Numerous = new Pod({
        name : 'numerous',
        description : 'Numeous',
        description_long : '<a href="http://numerousapp.com">Numerous</a> lets you track and share life’s most important numbers',
        authType : 'issuer_token',
        authMap : {
            username : 'API Key'
        },
        'renderers' : {
          'my_metrics' : {
            description : 'Get My Metrics',
            contentType : DEFS.CONTENTTYPE_JSON,
            properties : {
              'id' : {
                type : "string",
                description: 'ID'
              },
              'label' : {
                type : "string",
                description: 'Label'
              }
            }
          }
        }
    });

Numerous.rpc = function(action, method, sysImports, options, channel, req, res) {
  var self = this;
  if (method == 'my_metrics') {
    self._httpGet('https://api.numerousapp.com/v1/users/me/metrics', function(err, resp) {
      if (err) {
        res.send(err, 500);
      } else {
        res.send(resp);
      }
    },
    {
      'Authorization' : 'Basic ' + new Buffer(sysImports.auth.issuer_token.username + ':').toString('base64')
    });
    
  } else {
    this.__proto__.rpc.apply(this, arguments);
  }
}


// Include any actions
Numerous.add(require('./new_metric.js'));
Numerous.add(require('./increment_metric.js'));
Numerous.add(require('./update_metric.js'));

// -----------------------------------------------------------------------------
module.exports = Numerous;
