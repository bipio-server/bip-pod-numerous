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

var  FormData = require('form-data'),
https = require('https');

function NewMetric() {
}

NewMetric.prototype = {};

NewMetric.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var log = this.$resource.log,
    postReq = this.$resource._httpPost,
    $resource = this.$resource,
    schema = this.schema,
    self = this,
    form = new FormData(),
    imageFile,
    // host = "numerous.apiary-mock.com", // production mock
    //host = "numerous.apiary-proxy.com", // debug proxy mock
    host = "api.numerousapp.com",
    requestUrl = '/v1/metrics',
    file;


  // attach the first image file we find
  if (contentParts._files && contentParts._files.length) {
    for (var i = 0; i < contentParts._files.length; i++) {
      file = contentParts._files[i];
      if (0 === file.type.indexOf('image')) {
        imageFile = file;
        break;
      }
    }
  }

  var params = [],
  p = {};
  for (var k in imports) {
    if (imports.hasOwnProperty(k)) {
      if (imports[k]) {
        if (schema.imports.properties && schema.imports.properties[k] && 'integer' === schema.imports.properties[k].type) {
          imports[k] = Number(imports[k]);
        }
        p[k] = imports[k];
      }
    }
  }

  for (var k in imports) {
    if (imports.hasOwnProperty(k)) {
      if ('currencySymbol' === k && 'currency' !== imports.kind) {
        continue;
      }
      if (imports[k]) {
        p[k] = imports[k];
      }
    }
  }

  postReq('https://api.numerousapp.com/v1/metrics', p, function(err, exports) {
    if (err) {
      next(err);
    } else {
      if (imageFile) {
        var options = {
          protocol : 'https:',
          host: host,
          path: '/v1/metrics/' + exports.id + '/photo',
          auth : sysImports.auth.issuer_token.username + ':'
        };

        $resource.file.get(imageFile, function(err, fileStruct, stream) {
          if (err) {
            next(err);
          } else {
            //Do POST request, callback for response
            form.append('image', stream);
            var request = form.submit(options, function (err, res) {
              var body = '';

              if (err) {
                next(err);

              } else {
                if (res.statusCode !== 201) {
                  if (res.statusCode === 401) {
                    next('Invalid API key');
                  } else {
                    next('HTTP Error '  + res.statusCode);
                  }
                } else {
                  res.on('data', function(data){
                    body += data.toString();
                  });

                  res.on('end', function(){
                    try {
                      next(false, JSON.parse(body));
                    } catch (e) {
                      next(e.message);
                    }
                  });
                }
              }

              res.resume();
            });
          }
        });

      } else {
        next(false, exports);
      }
    }
  }, {
    'Authorization' : 'Basic ' + new Buffer(sysImports.auth.issuer_token.username + ':').toString('base64')
  });

}

// -----------------------------------------------------------------------------
module.exports = NewMetric;