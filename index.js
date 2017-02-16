/**
 *
 * The Bipio Numerous Pod.
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * @see http://docs.numerous.apiary.io
 */
var Pod = require('bip-pod'),
    Numerous = new Pod();

Numerous.testCredentials = function(struct, next) {
    var url = struct.username,
        config = this.getConfig();

    this._httpGet('https://api.numerousapp.com/v1/users/self', function(err, resp, headers, code) {
      if (err) {
        next("Not Authorized", 401);
      } else {
        next();
      }
    },
    {
      'Authorization' : 'Basic ' + new Buffer(struct.username + ':').toString('base64')
    });

}

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

// -----------------------------------------------------------------------------
module.exports = Numerous;
