var request = require("request");
var parseString = require("xml2js").parseString;
var iconv = require("iconv-lite");

module.exports = function(Resource) {

  Resource.searchDecs = function(search, cb) {
    var url = "http://decs.bvsalud.org/cgi-bin/mx/cgi=@vmx/decs/?words=" + search;
    var requestOptions = {
      encoding: null,
      method: "GET",
      uri: url
    };
    request(requestOptions, function(err, response, body) {
      var body = iconv.decode(new Buffer(body), "ISO-8859-1");
      parseString(body, function(err, result) {
        var decs = [];
        var responses = result.decsvmx.decsws_response;
        if (responses) {
          responses.forEach(function(elem) {
            var aux = {};
            var terms = {};
            var descriptors = elem.record_list[0].record[0].descriptor_list[0].descriptor;
            descriptors.forEach(function(d) {
              var key = d.$.lang;
              terms[key] = d._;
            });
            aux.terms = terms;
            aux.synonyms = elem.record_list[0].record[0].synonym_list[0].synonym;
            decs.push(aux);
          });
        }
        cb(null, decs);
      });
    });
  };

  Resource.remoteMethod(
    'searchDecs', {
      accepts: {
        arg: 'search',
        type: 'string'
      },
      returns: {
        arg: 'result',
        type: 'object'
      },
      http: {
        verb: 'get'
      }
    }
  );
};
