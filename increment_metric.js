/**
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
 */

function IncrementMetric() {
}

IncrementMetric.prototype = {};

IncrementMetric.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var postReq = this.$resource._httpPost,
    self = this,
    // host = "numerous.apiary-mock.com", // production mock
    //host = "numerous.apiary-proxy.com", // debug proxy mock
    host = "api.numerousapp.com",
    metricId = (imports.metric_id || imports.metric_id).trim(),
    value = Number(imports.value);

  if (!isNaN(value)) {
    postReq(
      'https://api.numerousapp.com/v1/metrics/' + metricId + '/events',
      {
        action : 'ADD',
        value : value
      },
      function(err, exports) {
        if (err) {
          next(err);
        } else {
          next(false, exports);
        }
      }, {
      'Authorization' : 'Basic ' + new Buffer(sysImports.auth.issuer_token.username + ':').toString('base64')
    });
  }
}

// -----------------------------------------------------------------------------
module.exports = IncrementMetric;