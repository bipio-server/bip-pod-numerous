/**
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
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
    metricId = (imports.metric_id || channel.config.metric_id).trim(),
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