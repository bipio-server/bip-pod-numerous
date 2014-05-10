/** 
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
 */

function UpdateMetric(podConfig) {
  this.name = 'update_metric';
  this.description = 'Update a Metric Value',
  this.description_long = 'Updates a Numerous Metrics Value',
  this.trigger = false; 
  this.singleton = false;
  this.auto = false;
  this.podConfig = podConfig;
}

UpdateMetric.prototype = {};

// UpdateMetric schema definition
// @see http://json-schema.org/
UpdateMetric.prototype.getSchema = function() {
  return {
    "config": {
      properties : {
        'metric_id' : {
          type : 'string',
          description : 'Metric',
          oneOf : [
            {
              '$ref' : '/renderers/my_metrics/{id}'
            }            
          ],
          label : {
            '$ref' : '/renderers/my_metrics/{label}'
          }
        }
      }
    },
    "imports": {
      "properties" : {
        'metric_id' : {
          type : 'string',
          description : 'Metric ID'
        },
        'value' : {
          type : 'string',
          description : 'Value',
          "default" : 1
        }
      }
    },    
    "exports": {
      "properties" : {
        "id" : {
          "type" : "string",
          "description" : "Event ID"
        },
        "metricId" : {
          "type" : "string",
          "description" : "Metric ID"
        },
        "value" : {
          "type" : "string",
          "description" : "New Value"
        }
      }
    }
  }
}

UpdateMetric.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var postReq = this.$resource._httpPost,
    schema = this.getSchema(),
    self = this,
    // host = "numerous.apiary-mock.com", // production mock
    //host = "numerous.apiary-proxy.com", // debug proxy mock
    host = "api.numerousapp.com",
    metricId = (imports.metric_id || channel.config.metric_id).trim(),
    value = imports.value ? Number(imports.value) : schema.imports.properties.value['default'];

  if (!isNaN(value)) {   
    postReq(
      'https://api.numerousapp.com/v1/metrics/' + metricId + '/events', 
      {
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
module.exports = UpdateMetric;