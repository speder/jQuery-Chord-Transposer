/*!
 * jQuery Chord Transposer plugin v1.0
 * http://codegavin.com/projects/transposer
 *
 * Copyright 2010, Jesse Gavin
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://codegavin.com/license
 *
 * Date: Sat Jun 26 21:27:00 2010 -0600
 */
(function($) {

/*!
 * jQuery Chord Transposer plugin v1.0
 * http://codegavin.com/projects/transposer
 *
 * Copyright 2010, Jesse Gavin
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://codegavin.com/license
 *
 * Date: Sat Jun 26 21:27:00 2010 -0600
 */
  $.fn.transpose = function(options) {
    var opts = $.extend({}, $.fn.transpose.defaults, options);
    
    var currentKey = null;
    
    var keys = [
      { name: 'Ab',  value: 0,   type: 'F', rel: 'Fm',  real: 1 },
      { name: 'A',   value: 1,   type: 'N', rel: 'F#m', real: 1 },
      { name: 'A#',  value: 2,   type: 'S', rel: 'Gm',  real: 0 },
      { name: 'Bb',  value: 2,   type: 'F', rel: 'Gm',  real: 1 },
      { name: 'B',   value: 3,   type: 'N', rel: 'G#m', real: 1 },
      { name: 'Cb',  value: 3,   type: 'F', rel: 'Abm', real: 0 },
      { name: 'C',   value: 4,   type: 'N', rel: 'Am',  real: 1 },
      { name: 'C#',  value: 5,   type: 'S', rel: 'A#m', real: 0 },
      { name: 'Db',  value: 5,   type: 'F', rel: 'Bbm', real: 1 },
      { name: 'D',   value: 6,   type: 'N', rel: 'Bm',  real: 1 },
      { name: 'D#',  value: 7,   type: 'S', rel: 'B#m', real: 0 },
      { name: 'Eb',  value: 7,   type: 'F', rel: 'Cm',  real: 1 },
      { name: 'E',   value: 8,   type: 'N', rel: 'C#m', real: 1 },
      { name: 'F',   value: 9,   type: 'N', rel: 'Dm',  real: 1 },
      { name: 'F#',  value: 10,  type: 'S', rel: 'D#m', real: 1 },
      { name: 'Gb',  value: 10,  type: 'F', rel: 'Ebm', real: 1 },
      { name: 'G',   value: 11,  type: 'N', rel: 'Em',  real: 1 },
      { name: 'G#',  value: 0,   type: 'S', rel: 'E#m', real: 0 }
    ];
  
    var getKeyByName = function (name) {
        if (name.charAt(name.length-1) == "m") {
          name = name.substring(0, name.length-1);
        }
        for (var i = 0; i < keys.length; i++) {
            if (name == keys[i].name) {
                return keys[i];
            }
        }
    };

    var getChordRoot = function (input) {
        if (input.length > 1 && (input.charAt(1) == "b" || input.charAt(1) == "#"))
            return input.substr(0, 2);
        else
            return input.substr(0, 1);
    };

    var getNewKey = function (oldKey, delta, targetKey) {
        var keyValue = getKeyByName(oldKey).value + delta;

        if (keyValue > 11) {
            keyValue -= 12;
        } else if (keyValue < 0) {
            keyValue += 12;
        }
        
        var i=0;
        if (keyValue == 0 || keyValue == 2 || keyValue == 5 || keyValue == 7 || keyValue == 10) {
            // Return the Flat or Sharp Key
            switch(targetKey.name) {
              case "A":
              case "A#":
              case "B":
              case "C":
              case "C#":
              case "D":
              case "D#":
              case "E":
              case "F#":
              case "G":
              case "G#":
                  for (;i<keys.length;i++) {
                    if (keys[i].value == keyValue && keys[i].type == "S") {
                      return keys[i];
                    }
                  }
              default:
                  for (;i<keys.length;i++) {
                    if (keys[i].value == keyValue && keys[i].type == "F") {
                      return keys[i];
                    }
                  }
            }
        }
        else {
            // Return the Natural Key
            for (;i<keys.length;i++) {
              if (keys[i].value == keyValue) {
                return keys[i];
              }
            }
        }
    };

    var getChordType = function (key) {
        switch (key.charAt(key.length - 1)) {
            case "b":
                return "F";
            case "#":
                return "S";
            default:
              return "N";
        }
    };

    var getDelta = function (oldIndex, newIndex) {
        if (oldIndex > newIndex)
            return 0 - (oldIndex - newIndex);
        else if (oldIndex < newIndex)
            return 0 + (newIndex - oldIndex);
        else
            return 0;
    };

    var transposeSong = function (target, key) {
        var newKey = getKeyByName(key);

        if (currentKey.name == newKey.name) {
          return;
        }

        var delta = getDelta(currentKey.value, newKey.value);
        
        $("span.c", target).each(function (i, el) {
            transposeChord(el, delta, newKey);
        });
        
        currentKey = newKey;
    };

    var transposeChord = function (selector, delta, targetKey) {
        var el = $(selector);
        var oldChord = el.text();
        if (oldChord.match(/^\|(\d\/\d)?$/)) { return }
        var oldChordRoot = getChordRoot(oldChord);
        var newChordRoot = getNewKey(oldChordRoot, delta, targetKey);
        var newChord = newChordRoot.name + oldChord.substr(oldChordRoot.length);
        el.text(newChord);

        var sib = el[0].nextSibling;
        if (sib && sib.nodeType == 3 && sib.nodeValue.length > 0 && sib.nodeValue.charAt(0) != "/") {
            var wsLength = getNewWhiteSpaceLength(oldChord.length, newChord.length, sib.nodeValue.length);
            sib.nodeValue = makeString(" ", wsLength);
        }
    };

    var getNewWhiteSpaceLength = function (a, b, c) {
        if (a > b)
            return (c + (a - b));
        else if (a < b)
            return (c - (b - a));
        else
            return c;
    };

    var makeString = function (s, repeat) {
        var o = [];
        for (var i = 0; i < repeat; i++) o.push(s);
        return o.join("");
    }
    
    
    var isChordLine = function (input) {
        var tokens = input.replace(/\s+/, " ").split(" ");

        // Try to find tokens that aren't chords
        // if we find one we know that this line is not a 'chord' line.
        for (var i = 0; i < tokens.length; i++) {
            if (!$.trim(tokens[i]).length == 0 && !tokens[i].match(opts.chordRegex))
                return false;
        }
        return true;
    };
    
    var wrapChords = function (input) {
        return input.replace(opts.chordReplaceRegex, "<span class='c'>$1</span>");
    };
    
    
    return $(this).each(function() {
    
      var startKey = $(this).attr("data-key");
      if (!startKey || $.trim(startKey) == "") {
        startKey = opts.key;
      }

      if (!startKey || $.trim(startKey) == "") {
        throw("Starting key not defined.");
        return this;
      }
      
      currentKey = getKeyByName(startKey);

      // Build tranpose links ===========================================
      var keyLinks = [];
      $(keys).each(function(i, key) {
          if (key.real == 1) {
              var key_pair = key.name + "<br />-<br />" + key.rel;
              if (currentKey.name == key.name)
                  keyLinks.push("<a href='#' class='selected'>" + key_pair + "</a>");
              else
                  keyLinks.push("<a href='#'>" + key_pair + "</a>");
          }
      });


      var $this = $(this);
      var keysHtml = $("<div class='transpose-keys'></div>");
      keysHtml.html(keyLinks.join(""));
      $("a", keysHtml).click(function(e) {
          e.preventDefault();
          var key = $(this).text().split('-')[0];
          transposeSong($this, key);
          $(".transpose-keys a").removeClass("selected");
          $(this).addClass("selected");
          return false;
      });
      
      $(this).after(keysHtml);

      var output = [];
      var lines = $(this).text().split("\n");
      var line, tmp = "";

      for (var i = 0; i < lines.length; i++) {
          line = lines[i];

          if (isChordLine(line))
              output.push("<span>" + wrapChords(line) + "</span>");
          else
              output.push("<span>" + line + "</span>");
      };

      $(this).html(output.join("\n"));
    });
  };

  $.fn.transpose.defaults = {
    chordRegex: /^([A-G\|](\d\/\d)?[b\#]?(maj|m|dim|aug|sus|\+|\-)?\d?(b|\#|\+|\-)?\d?)*(\/[A-G][b\#]*)*$/,
    chordReplaceRegex: re=/([A-G\|](\d\/\d)?[b\#]?(maj|m|dim|aug|sus|\+|\-)?\d?(b|\#|\+|\-)?\d?)/g
  };

})(jQuery);
