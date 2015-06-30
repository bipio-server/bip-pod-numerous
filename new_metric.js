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