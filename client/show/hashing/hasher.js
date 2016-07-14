var Module = function(Module) {
  Module = Module || {};

var e;
e || (e = eval("(function() { try { return Module || {} } catch(e) { return {} } })()"));
var aa = {}, k;
for (k in e) {
  e.hasOwnProperty(k) && (aa[k] = e[k]);
}
var ba = "object" === typeof window, ca = "function" === typeof importScripts, da = "object" === typeof process && "function" === typeof require && !ba && !ca, ea = !ba && !da && !ca;
if (da) {
  e.print || (e.print = function(a) {
    process.stdout.write(a + "\n");
  });
  e.printErr || (e.printErr = function(a) {
    process.stderr.write(a + "\n");
  });
  var fa = require("fs"), ga = require("path");
  e.read = function(a, b) {
    a = ga.normalize(a);
    var c = fa.readFileSync(a);
    c || a == ga.resolve(a) || (a = path.join(__dirname, "..", "src", a), c = fa.readFileSync(a));
    c && !b && (c = c.toString());
    return c;
  };
  e.readBinary = function(a) {
    a = e.read(a, !0);
    a.buffer || (a = new Uint8Array(a));
    assert(a.buffer);
    return a;
  };
  e.load = function(a) {
    ha(read(a));
  };
  e.thisProgram || (e.thisProgram = 1 < process.argv.length ? process.argv[1].replace(/\\/g, "/") : "unknown-program");
  e.arguments = process.argv.slice(2);
  "undefined" !== typeof module && (module.exports = e);
  process.on("uncaughtException", function(a) {
    if (!(a instanceof ia)) {
      throw a;
    }
  });
  e.inspect = function() {
    return "[Emscripten Module object]";
  };
} else {
  if (ea) {
    e.print || (e.print = print), "undefined" != typeof printErr && (e.printErr = printErr), e.read = "undefined" != typeof read ? read : function() {
      throw "no read() available (jsc?)";
    }, e.readBinary = function(a) {
      if ("function" === typeof readbuffer) {
        return new Uint8Array(readbuffer(a));
      }
      a = read(a, "binary");
      assert("object" === typeof a);
      return a;
    }, "undefined" != typeof scriptArgs ? e.arguments = scriptArgs : "undefined" != typeof arguments && (e.arguments = arguments), eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined");
  } else {
    if (ba || ca) {
      e.read = function(a) {
        var b = new XMLHttpRequest;
        b.open("GET", a, !1);
        b.send(null);
        return b.responseText;
      }, "undefined" != typeof arguments && (e.arguments = arguments), "undefined" !== typeof console ? (e.print || (e.print = function(a) {
        console.log(a);
      }), e.printErr || (e.printErr = function(a) {
        console.log(a);
      })) : e.print || (e.print = function() {
      }), ca && (e.load = importScripts), "undefined" === typeof e.setWindowTitle && (e.setWindowTitle = function(a) {
        document.title = a;
      });
    } else {
      throw "Unknown runtime environment. Where are we?";
    }
  }
}
function ha(a) {
  eval.call(null, a);
}
!e.load && e.read && (e.load = function(a) {
  ha(e.read(a));
});
e.print || (e.print = function() {
});
e.printErr || (e.printErr = e.print);
e.arguments || (e.arguments = []);
e.thisProgram || (e.thisProgram = "./this.program");
e.print = e.print;
e.W = e.printErr;
e.preRun = [];
e.postRun = [];
for (k in aa) {
  aa.hasOwnProperty(k) && (e[k] = aa[k]);
}
var n = {rb:function(a) {
  ja = a;
}, fb:function() {
  return ja;
}, ua:function() {
  return m;
}, ba:function(a) {
  m = a;
}, Ka:function(a) {
  switch(a) {
    case "i1":
    ;
    case "i8":
      return 1;
    case "i16":
      return 2;
    case "i32":
      return 4;
    case "i64":
      return 8;
    case "float":
      return 4;
    case "double":
      return 8;
    default:
      return "*" === a[a.length - 1] ? n.J : "i" === a[0] ? (a = parseInt(a.substr(1)), assert(0 === a % 8), a / 8) : 0;
  }
}, eb:function(a) {
  return Math.max(n.Ka(a), n.J);
}, ud:16, Pd:function(a, b) {
  "double" === b || "i64" === b ? a & 7 && (assert(4 === (a & 7)), a += 4) : assert(0 === (a & 3));
  return a;
}, Dd:function(a, b, c) {
  return c || "i64" != a && "double" != a ? a ? Math.min(b || (a ? n.eb(a) : 0), n.J) : Math.min(b, 8) : 8;
}, L:function(a, b, c) {
  return c && c.length ? (c.splice || (c = Array.prototype.slice.call(c)), c.splice(0, 0, b), e["dynCall_" + a].apply(null, c)) : e["dynCall_" + a].call(null, b);
}, Z:[], Xa:function(a) {
  for (var b = 0;b < n.Z.length;b++) {
    if (!n.Z[b]) {
      return n.Z[b] = a, 2 * (1 + b);
    }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
}, nb:function(a) {
  n.Z[(a - 2) / 2] = null;
}, O:function(a) {
  n.O.ta || (n.O.ta = {});
  n.O.ta[a] || (n.O.ta[a] = 1, e.W(a));
}, ma:{}, Gd:function(a, b) {
  assert(b);
  n.ma[b] || (n.ma[b] = {});
  var c = n.ma[b];
  c[a] || (c[a] = function() {
    return n.L(b, a, arguments);
  });
  return c[a];
}, Ed:function() {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
}, aa:function(a) {
  var b = m;
  m = m + a | 0;
  m = m + 15 & -16;
  return b;
}, Ra:function(a) {
  var b = la;
  la = la + a | 0;
  la = la + 15 & -16;
  return b;
}, R:function(a) {
  var b = q;
  q = q + a | 0;
  q = q + 15 & -16;
  if (a = q >= ma) {
    v("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + ma + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 "), a = !0;
  }
  return a ? (q = b, 0) : b;
}, ja:function(a, b) {
  return Math.ceil(a / (b ? b : 16)) * (b ? b : 16);
}, Md:function(a, b, c) {
  return c ? +(a >>> 0) + 4294967296 * +(b >>> 0) : +(a >>> 0) + 4294967296 * +(b | 0);
}, Ua:8, J:4, vd:0};
e.Runtime = n;
n.addFunction = n.Xa;
n.removeFunction = n.nb;
var w = !1, na, oa, ja;
function assert(a, b) {
  a || v("Assertion failed: " + b);
}
function pa(a) {
  var b = e["_" + a];
  if (!b) {
    try {
      b = eval("_" + a);
    } catch (c) {
    }
  }
  assert(b, "Cannot call unknown function " + a + " (perhaps LLVM optimizations or closure removed it?)");
  return b;
}
var qa, ra;
(function() {
  function a(a) {
    a = a.toString().match(d).slice(1);
    return {arguments:a[0], body:a[1], returnValue:a[2]};
  }
  var b = {stackSave:function() {
    n.ua();
  }, stackRestore:function() {
    n.ba();
  }, arrayToC:function(a) {
    var b = n.aa(a.length);
    sa(a, b);
    return b;
  }, stringToC:function(a) {
    var b = 0;
    null !== a && void 0 !== a && 0 !== a && (b = n.aa((a.length << 2) + 1), ta(a, b));
    return b;
  }}, c = {string:b.stringToC, array:b.arrayToC};
  ra = function(a, b, d, f, g) {
    a = pa(a);
    var t = [], z = 0;
    if (f) {
      for (var D = 0;D < f.length;D++) {
        var L = c[d[D]];
        L ? (0 === z && (z = n.ua()), t[D] = L(f[D])) : t[D] = f[D];
      }
    }
    d = a.apply(null, t);
    "string" === b && (d = x(d));
    if (0 !== z) {
      if (g && g.async) {
        EmterpreterAsync.xd.push(function() {
          n.ba(z);
        });
        return;
      }
      n.ba(z);
    }
    return d;
  };
  var d = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/, f = {}, g;
  for (g in b) {
    b.hasOwnProperty(g) && (f[g] = a(b[g]));
  }
  qa = function(b, c, d) {
    d = d || [];
    var g = pa(b);
    b = d.every(function(a) {
      return "number" === a;
    });
    var p = "string" !== c;
    if (p && b) {
      return g;
    }
    var t = d.map(function(a, b) {
      return "$" + b;
    });
    c = "(function(" + t.join(",") + ") {";
    var z = d.length;
    if (!b) {
      c += "var stack = " + f.stackSave.body + ";";
      for (var D = 0;D < z;D++) {
        var L = t[D], ka = d[D];
        "number" !== ka && (ka = f[ka + "ToC"], c += "var " + ka.arguments + " = " + L + ";", c += ka.body + ";", c += L + "=" + ka.returnValue + ";");
      }
    }
    d = a(function() {
      return g;
    }).returnValue;
    c += "var ret = " + d + "(" + t.join(",") + ");";
    p || (d = a(function() {
      return x;
    }).returnValue, c += "ret = " + d + "(ret);");
    b || (c += f.stackRestore.body.replace("()", "(stack)") + ";");
    return eval(c + "return ret})");
  };
})();
e.ccall = ra;
e.cwrap = qa;
function ua(a, b, c) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch(c) {
    case "i1":
      A[a >> 0] = b;
      break;
    case "i8":
      A[a >> 0] = b;
      break;
    case "i16":
      va[a >> 1] = b;
      break;
    case "i32":
      B[a >> 2] = b;
      break;
    case "i64":
      oa = [b >>> 0, (na = b, 1 <= +wa(na) ? 0 < na ? (xa(+ya(na / 4294967296), 4294967295) | 0) >>> 0 : ~~+za((na - +(~~na >>> 0)) / 4294967296) >>> 0 : 0)];
      B[a >> 2] = oa[0];
      B[a + 4 >> 2] = oa[1];
      break;
    case "float":
      Aa[a >> 2] = b;
      break;
    case "double":
      Ba[a >> 3] = b;
      break;
    default:
      v("invalid type for setValue: " + c);
  }
}
e.setValue = ua;
function Ca(a, b) {
  b = b || "i8";
  "*" === b.charAt(b.length - 1) && (b = "i32");
  switch(b) {
    case "i1":
      return A[a >> 0];
    case "i8":
      return A[a >> 0];
    case "i16":
      return va[a >> 1];
    case "i32":
      return B[a >> 2];
    case "i64":
      return B[a >> 2];
    case "float":
      return Aa[a >> 2];
    case "double":
      return Ba[a >> 3];
    default:
      v("invalid type for setValue: " + b);
  }
  return null;
}
e.getValue = Ca;
e.ALLOC_NORMAL = 0;
e.ALLOC_STACK = 1;
e.ALLOC_STATIC = 2;
e.ALLOC_DYNAMIC = 3;
e.ALLOC_NONE = 4;
function C(a, b, c, d) {
  var f, g;
  "number" === typeof a ? (f = !0, g = a) : (f = !1, g = a.length);
  var h = "string" === typeof b ? b : null;
  c = 4 == c ? d : [Da, n.aa, n.Ra, n.R][void 0 === c ? 2 : c](Math.max(g, h ? 1 : b.length));
  if (f) {
    d = c;
    assert(0 == (c & 3));
    for (a = c + (g & -4);d < a;d += 4) {
      B[d >> 2] = 0;
    }
    for (a = c + g;d < a;) {
      A[d++ >> 0] = 0;
    }
    return c;
  }
  if ("i8" === h) {
    return a.subarray || a.slice ? E.set(a, c) : E.set(new Uint8Array(a), c), c;
  }
  d = 0;
  for (var l, u;d < g;) {
    var r = a[d];
    "function" === typeof r && (r = n.Hd(r));
    f = h || b[d];
    0 === f ? d++ : ("i64" == f && (f = "i32"), ua(c + d, r, f), u !== f && (l = n.Ka(f), u = f), d += l);
  }
  return c;
}
e.allocate = C;
e.getMemory = function(a) {
  return Ea ? "undefined" !== typeof Fa && !Fa.F || !Ga ? n.R(a) : Da(a) : n.Ra(a);
};
function x(a, b) {
  if (0 === b || !a) {
    return "";
  }
  for (var c = 0, d, f = 0;;) {
    d = E[a + f >> 0];
    c |= d;
    if (0 == d && !b) {
      break;
    }
    f++;
    if (b && f == b) {
      break;
    }
  }
  b || (b = f);
  d = "";
  if (128 > c) {
    for (;0 < b;) {
      c = String.fromCharCode.apply(String, E.subarray(a, a + Math.min(b, 1024))), d = d ? d + c : c, a += 1024, b -= 1024;
    }
    return d;
  }
  return e.UTF8ToString(a);
}
e.Pointer_stringify = x;
e.AsciiToString = function(a) {
  for (var b = "";;) {
    var c = A[a++ >> 0];
    if (!c) {
      return b;
    }
    b += String.fromCharCode(c);
  }
};
e.stringToAscii = function(a, b) {
  return Ha(a, b, !1);
};
function Ia(a, b) {
  for (var c, d, f, g, h, l, u = "";;) {
    c = a[b++];
    if (!c) {
      return u;
    }
    c & 128 ? (d = a[b++] & 63, 192 == (c & 224) ? u += String.fromCharCode((c & 31) << 6 | d) : (f = a[b++] & 63, 224 == (c & 240) ? c = (c & 15) << 12 | d << 6 | f : (g = a[b++] & 63, 240 == (c & 248) ? c = (c & 7) << 18 | d << 12 | f << 6 | g : (h = a[b++] & 63, 248 == (c & 252) ? c = (c & 3) << 24 | d << 18 | f << 12 | g << 6 | h : (l = a[b++] & 63, c = (c & 1) << 30 | d << 24 | f << 18 | g << 12 | h << 6 | l))), 65536 > c ? u += String.fromCharCode(c) : (c -= 65536, u += String.fromCharCode(55296 | 
    c >> 10, 56320 | c & 1023)))) : u += String.fromCharCode(c);
  }
}
e.UTF8ArrayToString = Ia;
e.UTF8ToString = function(a) {
  return Ia(E, a);
};
function Ja(a, b, c, d) {
  if (!(0 < d)) {
    return 0;
  }
  var f = c;
  d = c + d - 1;
  for (var g = 0;g < a.length;++g) {
    var h = a.charCodeAt(g);
    55296 <= h && 57343 >= h && (h = 65536 + ((h & 1023) << 10) | a.charCodeAt(++g) & 1023);
    if (127 >= h) {
      if (c >= d) {
        break;
      }
      b[c++] = h;
    } else {
      if (2047 >= h) {
        if (c + 1 >= d) {
          break;
        }
        b[c++] = 192 | h >> 6;
      } else {
        if (65535 >= h) {
          if (c + 2 >= d) {
            break;
          }
          b[c++] = 224 | h >> 12;
        } else {
          if (2097151 >= h) {
            if (c + 3 >= d) {
              break;
            }
            b[c++] = 240 | h >> 18;
          } else {
            if (67108863 >= h) {
              if (c + 4 >= d) {
                break;
              }
              b[c++] = 248 | h >> 24;
            } else {
              if (c + 5 >= d) {
                break;
              }
              b[c++] = 252 | h >> 30;
              b[c++] = 128 | h >> 24 & 63;
            }
            b[c++] = 128 | h >> 18 & 63;
          }
          b[c++] = 128 | h >> 12 & 63;
        }
        b[c++] = 128 | h >> 6 & 63;
      }
      b[c++] = 128 | h & 63;
    }
  }
  b[c] = 0;
  return c - f;
}
e.stringToUTF8Array = Ja;
e.stringToUTF8 = function(a, b, c) {
  return Ja(a, E, b, c);
};
function Ka(a) {
  for (var b = 0, c = 0;c < a.length;++c) {
    var d = a.charCodeAt(c);
    55296 <= d && 57343 >= d && (d = 65536 + ((d & 1023) << 10) | a.charCodeAt(++c) & 1023);
    127 >= d ? ++b : b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : 2097151 >= d ? b + 4 : 67108863 >= d ? b + 5 : b + 6;
  }
  return b;
}
e.lengthBytesUTF8 = Ka;
e.UTF16ToString = function(a) {
  for (var b = 0, c = "";;) {
    var d = va[a + 2 * b >> 1];
    if (0 == d) {
      return c;
    }
    ++b;
    c += String.fromCharCode(d);
  }
};
e.stringToUTF16 = function(a, b, c) {
  void 0 === c && (c = 2147483647);
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var d = b;
  c = c < 2 * a.length ? c / 2 : a.length;
  for (var f = 0;f < c;++f) {
    va[b >> 1] = a.charCodeAt(f), b += 2;
  }
  va[b >> 1] = 0;
  return b - d;
};
e.lengthBytesUTF16 = function(a) {
  return 2 * a.length;
};
e.UTF32ToString = function(a) {
  for (var b = 0, c = "";;) {
    var d = B[a + 4 * b >> 2];
    if (0 == d) {
      return c;
    }
    ++b;
    65536 <= d ? (d = d - 65536, c += String.fromCharCode(55296 | d >> 10, 56320 | d & 1023)) : c += String.fromCharCode(d);
  }
};
e.stringToUTF32 = function(a, b, c) {
  void 0 === c && (c = 2147483647);
  if (4 > c) {
    return 0;
  }
  var d = b;
  c = d + c - 4;
  for (var f = 0;f < a.length;++f) {
    var g = a.charCodeAt(f);
    if (55296 <= g && 57343 >= g) {
      var h = a.charCodeAt(++f), g = 65536 + ((g & 1023) << 10) | h & 1023
    }
    B[b >> 2] = g;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  B[b >> 2] = 0;
  return b - d;
};
e.lengthBytesUTF32 = function(a) {
  for (var b = 0, c = 0;c < a.length;++c) {
    var d = a.charCodeAt(c);
    55296 <= d && 57343 >= d && ++c;
    b += 4;
  }
  return b;
};
function La(a) {
  function b(c, d, f) {
    d = d || Infinity;
    var g = "", h = [], t;
    if ("N" === a[l]) {
      l++;
      "K" === a[l] && l++;
      for (t = [];"E" !== a[l];) {
        if ("S" === a[l]) {
          l++;
          var y = a.indexOf("_", l);
          t.push(r[a.substring(l, y) || 0] || "?");
          l = y + 1;
        } else {
          if ("C" === a[l]) {
            t.push(t[t.length - 1]), l += 2;
          } else {
            var y = parseInt(a.substr(l)), U = y.toString().length;
            if (!y || !U) {
              l--;
              break;
            }
            var Nb = a.substr(l + U, y);
            t.push(Nb);
            r.push(Nb);
            l += U + y;
          }
        }
      }
      l++;
      t = t.join("::");
      d--;
      if (0 === d) {
        return c ? [t] : t;
      }
    } else {
      if (("K" === a[l] || p && "L" === a[l]) && l++, y = parseInt(a.substr(l))) {
        U = y.toString().length, t = a.substr(l + U, y), l += U + y;
      }
    }
    p = !1;
    "I" === a[l] ? (l++, y = b(!0), U = b(!0, 1, !0), g += U[0] + " " + t + "<" + y.join(", ") + ">") : g = t;
    a: for (;l < a.length && 0 < d--;) {
      if (t = a[l++], t in u) {
        h.push(u[t]);
      } else {
        switch(t) {
          case "P":
            h.push(b(!0, 1, !0)[0] + "*");
            break;
          case "R":
            h.push(b(!0, 1, !0)[0] + "&");
            break;
          case "L":
            l++;
            y = a.indexOf("E", l) - l;
            h.push(a.substr(l, y));
            l += y + 2;
            break;
          case "A":
            y = parseInt(a.substr(l));
            l += y.toString().length;
            if ("_" !== a[l]) {
              throw "?";
            }
            l++;
            h.push(b(!0, 1, !0)[0] + " [" + y + "]");
            break;
          case "E":
            break a;
          default:
            g += "?" + t;
            break a;
        }
      }
    }
    f || 1 !== h.length || "void" !== h[0] || (h = []);
    return c ? (g && h.push(g + "?"), h) : g + ("(" + h.join(", ") + ")");
  }
  var c = !!e.___cxa_demangle;
  if (c) {
    try {
      var d = Da(a.length);
      ta(a.substr(1), d);
      var f = Da(4), g = e.___cxa_demangle(d, 0, 0, f);
      if (0 === Ca(f, "i32") && g) {
        return x(g);
      }
    } catch (h) {
    } finally {
      d && Ma(d), f && Ma(f), g && Ma(g);
    }
  }
  var l = 3, u = {v:"void", b:"bool", c:"char", s:"short", i:"int", l:"long", f:"float", d:"double", w:"wchar_t", a:"signed char", h:"unsigned char", t:"unsigned short", j:"unsigned int", m:"unsigned long", x:"long long", y:"unsigned long long", z:"..."}, r = [], p = !0, d = a;
  try {
    if ("Object._main" == a || "_main" == a) {
      return "main()";
    }
    "number" === typeof a && (a = x(a));
    if ("_" !== a[0] || "_" !== a[1] || "Z" !== a[2]) {
      return a;
    }
    switch(a[3]) {
      case "n":
        return "operator new()";
      case "d":
        return "operator delete()";
    }
    d = b();
  } catch (t) {
    d += "?";
  }
  0 <= d.indexOf("?") && !c && n.O("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
  return d;
}
function Na() {
  return Oa().replace(/__Z[\w\d_]+/g, function(a) {
    var b = La(a);
    return a === b ? a : a + " [" + b + "]";
  });
}
function Oa() {
  var a = Error();
  if (!a.stack) {
    try {
      throw Error(0);
    } catch (b) {
      a = b;
    }
    if (!a.stack) {
      return "(no stack trace available)";
    }
  }
  return a.stack.toString();
}
e.stackTrace = function() {
  return Na();
};
function Pa() {
  var a = q;
  0 < a % 4096 && (a += 4096 - a % 4096);
  return a;
}
for (var A, E, va, Qa, B, Ra, Aa, Ba, Sa = 0, la = 0, Ea = !1, Ta = 0, m = 0, Ua = 0, Va = 0, q = 0, Wa = e.TOTAL_STACK || 5242880, ma = e.TOTAL_MEMORY || 16777216, G = 65536;G < ma || G < 2 * Wa;) {
  G = 16777216 > G ? 2 * G : G + 16777216;
}
G !== ma && (ma = G);
assert("undefined" !== typeof Int32Array && "undefined" !== typeof Float64Array && !!(new Int32Array(1)).subarray && !!(new Int32Array(1)).set, "JS engine does not provide full typed array support");
var buffer;
buffer = new ArrayBuffer(ma);
A = new Int8Array(buffer);
va = new Int16Array(buffer);
B = new Int32Array(buffer);
E = new Uint8Array(buffer);
Qa = new Uint16Array(buffer);
Ra = new Uint32Array(buffer);
Aa = new Float32Array(buffer);
Ba = new Float64Array(buffer);
B[0] = 255;
assert(255 === E[0] && 0 === E[3], "Typed arrays 2 must be run on a little-endian system");
e.HEAP = void 0;
e.buffer = buffer;
e.HEAP8 = A;
e.HEAP16 = va;
e.HEAP32 = B;
e.HEAPU8 = E;
e.HEAPU16 = Qa;
e.HEAPU32 = Ra;
e.HEAPF32 = Aa;
e.HEAPF64 = Ba;
function Xa(a) {
  for (;0 < a.length;) {
    var b = a.shift();
    if ("function" == typeof b) {
      b();
    } else {
      var c = b.ab;
      "number" === typeof c ? void 0 === b.X ? n.L("v", c) : n.L("vi", c, [b.X]) : c(void 0 === b.X ? null : b.X);
    }
  }
}
var Ya = [], Za = [], $a = [], H = [], ab = [], Ga = !1;
function bb(a) {
  Ya.unshift(a);
}
e.addOnPreRun = bb;
e.addOnInit = function(a) {
  Za.unshift(a);
};
e.addOnPreMain = function(a) {
  $a.unshift(a);
};
e.addOnExit = function(a) {
  H.unshift(a);
};
function cb(a) {
  ab.unshift(a);
}
e.addOnPostRun = cb;
function db(a, b, c) {
  c = Array(0 < c ? c : Ka(a) + 1);
  a = Ja(a, c, 0, c.length);
  b && (c.length = a);
  return c;
}
e.intArrayFromString = db;
e.intArrayToString = function(a) {
  for (var b = [], c = 0;c < a.length;c++) {
    var d = a[c];
    255 < d && (d &= 255);
    b.push(String.fromCharCode(d));
  }
  return b.join("");
};
function ta(a, b, c) {
  a = db(a, c);
  for (c = 0;c < a.length;) {
    A[b + c >> 0] = a[c], c += 1;
  }
}
e.writeStringToMemory = ta;
function sa(a, b) {
  for (var c = 0;c < a.length;c++) {
    A[b++ >> 0] = a[c];
  }
}
e.writeArrayToMemory = sa;
function Ha(a, b, c) {
  for (var d = 0;d < a.length;++d) {
    A[b++ >> 0] = a.charCodeAt(d);
  }
  c || (A[b >> 0] = 0);
}
e.writeAsciiToMemory = Ha;
Math.imul && -5 === Math.imul(4294967295, 5) || (Math.imul = function(a, b) {
  var c = a & 65535, d = b & 65535;
  return c * d + ((a >>> 16) * d + c * (b >>> 16) << 16) | 0;
});
Math.Id = Math.imul;
Math.clz32 || (Math.clz32 = function(a) {
  a = a >>> 0;
  for (var b = 0;32 > b;b++) {
    if (a & 1 << 31 - b) {
      return b;
    }
  }
  return 32;
});
Math.zd = Math.clz32;
var wa = Math.abs, za = Math.ceil, ya = Math.floor, xa = Math.min, I = 0, eb = null, fb = null;
function gb() {
  I++;
  e.monitorRunDependencies && e.monitorRunDependencies(I);
}
e.addRunDependency = gb;
function hb() {
  I--;
  e.monitorRunDependencies && e.monitorRunDependencies(I);
  if (0 == I && (null !== eb && (clearInterval(eb), eb = null), fb)) {
    var a = fb;
    fb = null;
    a();
  }
}
e.removeRunDependency = hb;
e.preloadedImages = {};
e.preloadedAudios = {};
Sa = 8;
la = Sa + 2080;
Za.push();
C([1, 0, 0, 0, 0, 0, 0, 0, 130, 128, 0, 0, 0, 0, 0, 0, 138, 128, 0, 0, 0, 0, 0, 128, 0, 128, 0, 128, 0, 0, 0, 128, 139, 128, 0, 0, 0, 0, 0, 0, 1, 0, 0, 128, 0, 0, 0, 0, 129, 128, 0, 128, 0, 0, 0, 128, 9, 128, 0, 0, 0, 0, 0, 128, 138, 0, 0, 0, 0, 0, 0, 0, 136, 0, 0, 0, 0, 0, 0, 0, 9, 128, 0, 128, 0, 0, 0, 0, 10, 0, 0, 128, 0, 0, 0, 0, 139, 128, 0, 128, 0, 0, 0, 0, 139, 0, 0, 0, 0, 0, 0, 128, 137, 128, 0, 0, 0, 0, 0, 128, 3, 128, 0, 0, 0, 0, 0, 128, 2, 128, 0, 0, 0, 0, 0, 128, 128, 0, 0, 0, 0, 0, 0, 
128, 10, 128, 0, 0, 0, 0, 0, 0, 10, 0, 0, 128, 0, 0, 0, 128, 129, 128, 0, 128, 0, 0, 0, 128, 128, 128, 0, 0, 0, 0, 0, 128, 1, 0, 0, 128, 0, 0, 0, 0, 8, 128, 0, 128, 0, 0, 0, 128, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 
31, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 45, 95, 98, 108, 111, 99, 107, 95, 
115, 105, 122, 101, 32, 62, 32, 100, 105, 103, 101, 115, 116, 95, 108, 101, 110, 103, 116, 104, 0, 108, 105, 98, 114, 104, 97, 115, 104, 47, 115, 104, 97, 51, 46, 99, 0, 114, 104, 97, 115, 104, 95, 115, 104, 97, 51, 95, 102, 105, 110, 97, 108, 0, 114, 97, 116, 101, 32, 60, 61, 32, 49, 54, 48, 48, 32, 38, 38, 32, 40, 114, 97, 116, 101, 32, 37, 32, 54, 52, 41, 32, 61, 61, 32, 48, 0, 114, 104, 97, 115, 104, 95, 107, 101, 99, 99, 97, 107, 95, 105, 110, 105, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "i8", 4, n.Ua);
var ib = n.ja(C(12, "i8", 2), 8);
assert(0 == ib % 8);
function jb(a) {
  e.___errno_location && (B[e.___errno_location() >> 2] = a);
  return a;
}
var J = {I:1, D:2, ed:3, bc:4, H:5, Aa:6, vb:7, zc:8, ea:9, Jb:10, va:11, qd:11, Ta:12, da:13, Vb:14, Lc:15, fa:16, wa:17, rd:18, ha:19, ya:20, P:21, q:22, uc:23, Sa:24, Q:25, nd:26, Wb:27, Hc:28, ia:29, bd:30, nc:31, Vc:32, Sb:33, Zc:34, Dc:42, Zb:43, Kb:44, ec:45, fc:46, gc:47, mc:48, od:49, xc:50, dc:51, Pb:35, Ac:37, Bb:52, Eb:53, sd:54, vc:55, Fb:56, Gb:57, Qb:35, Hb:59, Jc:60, yc:61, kd:62, Ic:63, Ec:64, Fc:65, ad:66, Bc:67, yb:68, gd:69, Lb:70, Wc:71, pc:72, Tb:73, Db:74, Qc:76, Cb:77, $c:78, 
hc:79, ic:80, lc:81, kc:82, jc:83, Kc:38, za:39, qc:36, ga:40, Rc:95, Uc:96, Ob:104, wc:105, zb:97, Yc:91, Oc:88, Gc:92, cd:108, Nb:111, wb:98, Mb:103, tc:101, rc:100, ld:110, Xb:112, Yb:113, ac:115, Ab:114, Rb:89, oc:90, Xc:93, dd:94, xb:99, sc:102, cc:106, Mc:107, md:109, pd:87, Ub:122, hd:116, Pc:95, Cc:123, $b:84, Sc:75, Ib:125, Nc:131, Tc:130, jd:86};
e._memset = kb;
function lb(a, b) {
  H.push(function() {
    n.L("vi", a, [b]);
  });
  lb.level = H.length;
}
e._bitshift64Lshr = mb;
e._bitshift64Shl = nb;
var ob = {0:"Success", 1:"Not super-user", 2:"No such file or directory", 3:"No such process", 4:"Interrupted system call", 5:"I/O error", 6:"No such device or address", 7:"Arg list too long", 8:"Exec format error", 9:"Bad file number", 10:"No children", 11:"No more processes", 12:"Not enough core", 13:"Permission denied", 14:"Bad address", 15:"Block device required", 16:"Mount device busy", 17:"File exists", 18:"Cross-device link", 19:"No such device", 20:"Not a directory", 21:"Is a directory", 
22:"Invalid argument", 23:"Too many open files in system", 24:"Too many open files", 25:"Not a typewriter", 26:"Text file busy", 27:"File too large", 28:"No space left on device", 29:"Illegal seek", 30:"Read only file system", 31:"Too many links", 32:"Broken pipe", 33:"Math arg out of domain of func", 34:"Math result not representable", 35:"File locking deadlock error", 36:"File or path name too long", 37:"No record locks available", 38:"Function not implemented", 39:"Directory not empty", 40:"Too many symbolic links", 
42:"No message of desired type", 43:"Identifier removed", 44:"Channel number out of range", 45:"Level 2 not synchronized", 46:"Level 3 halted", 47:"Level 3 reset", 48:"Link number out of range", 49:"Protocol driver not attached", 50:"No CSI structure available", 51:"Level 2 halted", 52:"Invalid exchange", 53:"Invalid request descriptor", 54:"Exchange full", 55:"No anode", 56:"Invalid request code", 57:"Invalid slot", 59:"Bad font file fmt", 60:"Device not a stream", 61:"No data (for no delay io)", 
62:"Timer expired", 63:"Out of streams resources", 64:"Machine is not on the network", 65:"Package not installed", 66:"The object is remote", 67:"The link has been severed", 68:"Advertise error", 69:"Srmount error", 70:"Communication error on send", 71:"Protocol error", 72:"Multihop attempted", 73:"Cross mount point (not really error)", 74:"Trying to read unreadable message", 75:"Value too large for defined data type", 76:"Given log. name not unique", 77:"f.d. invalid for this operation", 78:"Remote address changed", 
79:"Can   access a needed shared lib", 80:"Accessing a corrupted shared lib", 81:".lib section in a.out corrupted", 82:"Attempting to link in too many libs", 83:"Attempting to exec a shared library", 84:"Illegal byte sequence", 86:"Streams pipe error", 87:"Too many users", 88:"Socket operation on non-socket", 89:"Destination address required", 90:"Message too long", 91:"Protocol wrong type for socket", 92:"Protocol not available", 93:"Unknown protocol", 94:"Socket type not supported", 95:"Not supported", 
96:"Protocol family not supported", 97:"Address family not supported by protocol family", 98:"Address already in use", 99:"Address not available", 100:"Network interface is not configured", 101:"Network is unreachable", 102:"Connection reset by network", 103:"Connection aborted", 104:"Connection reset by peer", 105:"No buffer space available", 106:"Socket is already connected", 107:"Socket is not connected", 108:"Can't send after socket shutdown", 109:"Too many references", 110:"Connection timed out", 
111:"Connection refused", 112:"Host is down", 113:"Host is unreachable", 114:"Socket already connected", 115:"Connection already in progress", 116:"Stale file handle", 122:"Quota exceeded", 123:"No medium (in tape drive)", 125:"Operation canceled", 130:"Previous owner died", 131:"State not recoverable"};
function pb(a, b) {
  for (var c = 0, d = a.length - 1;0 <= d;d--) {
    var f = a[d];
    "." === f ? a.splice(d, 1) : ".." === f ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
  }
  if (b) {
    for (;c--;c) {
      a.unshift("..");
    }
  }
  return a;
}
function qb(a) {
  var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
  (a = pb(a.split("/").filter(function(a) {
    return !!a;
  }), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}
function rb(a) {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b && (b = b.substr(0, b.length - 1));
  return a + b;
}
function sb(a) {
  if ("/" === a) {
    return "/";
  }
  var b = a.lastIndexOf("/");
  return -1 === b ? a : a.substr(b + 1);
}
function tb() {
  var a = Array.prototype.slice.call(arguments, 0);
  return qb(a.join("/"));
}
function K(a, b) {
  return qb(a + "/" + b);
}
function ub() {
  for (var a = "", b = !1, c = arguments.length - 1;-1 <= c && !b;c--) {
    b = 0 <= c ? arguments[c] : "/";
    if ("string" !== typeof b) {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (!b) {
      return "";
    }
    a = b + "/" + a;
    b = "/" === b.charAt(0);
  }
  a = pb(a.split("/").filter(function(a) {
    return !!a;
  }), !b).join("/");
  return (b ? "/" : "") + a || ".";
}
var vb = [];
function wb(a, b) {
  vb[a] = {input:[], output:[], N:b};
  xb(a, yb);
}
var yb = {open:function(a) {
  var b = vb[a.g.rdev];
  if (!b) {
    throw new M(J.ha);
  }
  a.tty = b;
  a.seekable = !1;
}, close:function(a) {
  a.tty.N.flush(a.tty);
}, flush:function(a) {
  a.tty.N.flush(a.tty);
}, read:function(a, b, c, d) {
  if (!a.tty || !a.tty.N.La) {
    throw new M(J.Aa);
  }
  for (var f = 0, g = 0;g < d;g++) {
    var h;
    try {
      h = a.tty.N.La(a.tty);
    } catch (l) {
      throw new M(J.H);
    }
    if (void 0 === h && 0 === f) {
      throw new M(J.va);
    }
    if (null === h || void 0 === h) {
      break;
    }
    f++;
    b[c + g] = h;
  }
  f && (a.g.timestamp = Date.now());
  return f;
}, write:function(a, b, c, d) {
  if (!a.tty || !a.tty.N.qa) {
    throw new M(J.Aa);
  }
  for (var f = 0;f < d;f++) {
    try {
      a.tty.N.qa(a.tty, b[c + f]);
    } catch (g) {
      throw new M(J.H);
    }
  }
  d && (a.g.timestamp = Date.now());
  return f;
}}, zb = {La:function(a) {
  if (!a.input.length) {
    var b = null;
    if (da) {
      var c = new Buffer(256), d = 0, f = process.stdin.fd, g = !1;
      try {
        f = fs.openSync("/dev/stdin", "r"), g = !0;
      } catch (h) {
      }
      d = fs.readSync(f, c, 0, 256, null);
      g && fs.closeSync(f);
      0 < d ? b = c.slice(0, d).toString("utf-8") : b = null;
    } else {
      "undefined" != typeof window && "function" == typeof window.prompt ? (b = window.prompt("Input: "), null !== b && (b += "\n")) : "function" == typeof readline && (b = readline(), null !== b && (b += "\n"));
    }
    if (!b) {
      return null;
    }
    a.input = db(b, !0);
  }
  return a.input.shift();
}, qa:function(a, b) {
  null === b || 10 === b ? (e.print(Ia(a.output, 0)), a.output = []) : 0 != b && a.output.push(b);
}, flush:function(a) {
  a.output && 0 < a.output.length && (e.print(Ia(a.output, 0)), a.output = []);
}}, Ab = {qa:function(a, b) {
  null === b || 10 === b ? (e.printErr(Ia(a.output, 0)), a.output = []) : 0 != b && a.output.push(b);
}, flush:function(a) {
  a.output && 0 < a.output.length && (e.printErr(Ia(a.output, 0)), a.output = []);
}}, N = {B:null, u:function() {
  return N.createNode(null, "/", 16895, 0);
}, createNode:function(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new M(J.I);
  }
  N.B || (N.B = {dir:{g:{C:N.k.C, p:N.k.p, lookup:N.k.lookup, T:N.k.T, rename:N.k.rename, unlink:N.k.unlink, rmdir:N.k.rmdir, readdir:N.k.readdir, symlink:N.k.symlink}, stream:{G:N.n.G}}, file:{g:{C:N.k.C, p:N.k.p}, stream:{G:N.n.G, read:N.n.read, write:N.n.write, Ba:N.n.Ba, Na:N.n.Na, Pa:N.n.Pa}}, link:{g:{C:N.k.C, p:N.k.p, readlink:N.k.readlink}, stream:{}}, Ea:{g:{C:N.k.C, p:N.k.p}, stream:Bb}});
  c = Cb(a, b, c, d);
  O(c.mode) ? (c.k = N.B.dir.g, c.n = N.B.dir.stream, c.e = {}) : 32768 === (c.mode & 61440) ? (c.k = N.B.file.g, c.n = N.B.file.stream, c.o = 0, c.e = null) : 40960 === (c.mode & 61440) ? (c.k = N.B.link.g, c.n = N.B.link.stream) : 8192 === (c.mode & 61440) && (c.k = N.B.Ea.g, c.n = N.B.Ea.stream);
  c.timestamp = Date.now();
  a && (a.e[b] = c);
  return c;
}, cb:function(a) {
  if (a.e && a.e.subarray) {
    for (var b = [], c = 0;c < a.o;++c) {
      b.push(a.e[c]);
    }
    return b;
  }
  return a.e;
}, Fd:function(a) {
  return a.e ? a.e.subarray ? a.e.subarray(0, a.o) : new Uint8Array(a.e) : new Uint8Array;
}, Ga:function(a, b) {
  a.e && a.e.subarray && b > a.e.length && (a.e = N.cb(a), a.o = a.e.length);
  if (!a.e || a.e.subarray) {
    var c = a.e ? a.e.buffer.byteLength : 0;
    c >= b || (b = Math.max(b, c * (1048576 > c ? 2 : 1.125) | 0), 0 != c && (b = Math.max(b, 256)), c = a.e, a.e = new Uint8Array(b), 0 < a.o && a.e.set(c.subarray(0, a.o), 0));
  } else {
    for (!a.e && 0 < b && (a.e = []);a.e.length < b;) {
      a.e.push(0);
    }
  }
}, ob:function(a, b) {
  if (a.o != b) {
    if (0 == b) {
      a.e = null, a.o = 0;
    } else {
      if (!a.e || a.e.subarray) {
        var c = a.e;
        a.e = new Uint8Array(new ArrayBuffer(b));
        c && a.e.set(c.subarray(0, Math.min(b, a.o)));
      } else {
        if (a.e || (a.e = []), a.e.length > b) {
          a.e.length = b;
        } else {
          for (;a.e.length < b;) {
            a.e.push(0);
          }
        }
      }
      a.o = b;
    }
  }
}, k:{C:function(a) {
  var b = {};
  b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
  b.ino = a.id;
  b.mode = a.mode;
  b.nlink = 1;
  b.uid = 0;
  b.gid = 0;
  b.rdev = a.rdev;
  O(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.o : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.atime = new Date(a.timestamp);
  b.mtime = new Date(a.timestamp);
  b.ctime = new Date(a.timestamp);
  b.K = 4096;
  b.blocks = Math.ceil(b.size / b.K);
  return b;
}, p:function(a, b) {
  void 0 !== b.mode && (a.mode = b.mode);
  void 0 !== b.timestamp && (a.timestamp = b.timestamp);
  void 0 !== b.size && N.ob(a, b.size);
}, lookup:function() {
  throw Db[J.D];
}, T:function(a, b, c, d) {
  return N.createNode(a, b, c, d);
}, rename:function(a, b, c) {
  if (O(a.mode)) {
    var d;
    try {
      d = Eb(b, c);
    } catch (f) {
    }
    if (d) {
      for (var g in d.e) {
        throw new M(J.za);
      }
    }
  }
  delete a.parent.e[a.name];
  a.name = c;
  b.e[c] = a;
  a.parent = b;
}, unlink:function(a, b) {
  delete a.e[b];
}, rmdir:function(a, b) {
  var c = Eb(a, b), d;
  for (d in c.e) {
    throw new M(J.za);
  }
  delete a.e[b];
}, readdir:function(a) {
  var b = [".", ".."], c;
  for (c in a.e) {
    a.e.hasOwnProperty(c) && b.push(c);
  }
  return b;
}, symlink:function(a, b, c) {
  a = N.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, readlink:function(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new M(J.q);
  }
  return a.link;
}}, n:{read:function(a, b, c, d, f) {
  var g = a.g.e;
  if (f >= a.g.o) {
    return 0;
  }
  a = Math.min(a.g.o - f, d);
  assert(0 <= a);
  if (8 < a && g.subarray) {
    b.set(g.subarray(f, f + a), c);
  } else {
    for (d = 0;d < a;d++) {
      b[c + d] = g[f + d];
    }
  }
  return a;
}, write:function(a, b, c, d, f, g) {
  if (!d) {
    return 0;
  }
  a = a.g;
  a.timestamp = Date.now();
  if (b.subarray && (!a.e || a.e.subarray)) {
    if (g) {
      return a.e = b.subarray(c, c + d), a.o = d;
    }
    if (0 === a.o && 0 === f) {
      return a.e = new Uint8Array(b.subarray(c, c + d)), a.o = d;
    }
    if (f + d <= a.o) {
      return a.e.set(b.subarray(c, c + d), f), d;
    }
  }
  N.Ga(a, f + d);
  if (a.e.subarray && b.subarray) {
    a.e.set(b.subarray(c, c + d), f);
  } else {
    for (g = 0;g < d;g++) {
      a.e[f + g] = b[c + g];
    }
  }
  a.o = Math.max(a.o, f + d);
  return d;
}, G:function(a, b, c) {
  1 === c ? b += a.position : 2 === c && 32768 === (a.g.mode & 61440) && (b += a.g.o);
  if (0 > b) {
    throw new M(J.q);
  }
  return b;
}, Ba:function(a, b, c) {
  N.Ga(a.g, b + c);
  a.g.o = Math.max(a.g.o, b + c);
}, Na:function(a, b, c, d, f, g, h) {
  if (32768 !== (a.g.mode & 61440)) {
    throw new M(J.ha);
  }
  c = a.g.e;
  if (h & 2 || c.buffer !== b && c.buffer !== b.buffer) {
    if (0 < f || f + d < a.g.o) {
      c.subarray ? c = c.subarray(f, f + d) : c = Array.prototype.slice.call(c, f, f + d);
    }
    a = !0;
    d = Da(d);
    if (!d) {
      throw new M(J.Ta);
    }
    b.set(c, d);
  } else {
    a = !1, d = c.byteOffset;
  }
  return {Qd:d, wd:a};
}, Pa:function(a, b, c, d, f) {
  if (32768 !== (a.g.mode & 61440)) {
    throw new M(J.ha);
  }
  if (f & 2) {
    return 0;
  }
  N.n.write(a, b, 0, d, c, !1);
  return 0;
}}}, P = {$:!1, sb:function() {
  P.$ = !!process.platform.match(/^win/);
}, u:function(a) {
  assert(da);
  return P.createNode(null, "/", P.Ja(a.pa.root), 0);
}, createNode:function(a, b, c) {
  if (!O(c) && 32768 !== (c & 61440) && 40960 !== (c & 61440)) {
    throw new M(J.q);
  }
  a = Cb(a, b, c);
  a.k = P.k;
  a.n = P.n;
  return a;
}, Ja:function(a) {
  var b;
  try {
    b = fs.lstatSync(a), P.$ && (b.mode = b.mode | (b.mode & 146) >> 1);
  } catch (c) {
    if (!c.code) {
      throw c;
    }
    throw new M(J[c.code]);
  }
  return b.mode;
}, A:function(a) {
  for (var b = [];a.parent !== a;) {
    b.push(a.name), a = a.parent;
  }
  b.push(a.u.pa.root);
  b.reverse();
  return tb.apply(null, b);
}, Ha:{0:"r", 1:"r+", 2:"r+", 64:"r", 65:"r+", 66:"r+", 129:"rx+", 193:"rx+", 514:"w+", 577:"w", 578:"w+", 705:"wx", 706:"wx+", 1024:"a", 1025:"a", 1026:"a+", 1089:"a", 1090:"a+", 1153:"ax", 1154:"ax+", 1217:"ax", 1218:"ax+", 4096:"rs", 4098:"rs+"}, $a:function(a) {
  a &= -32769;
  if (a in P.Ha) {
    return P.Ha[a];
  }
  throw new M(J.q);
}, k:{C:function(a) {
  a = P.A(a);
  var b;
  try {
    b = fs.lstatSync(a);
  } catch (c) {
    if (!c.code) {
      throw c;
    }
    throw new M(J[c.code]);
  }
  P.$ && !b.K && (b.K = 4096);
  P.$ && !b.blocks && (b.blocks = (b.size + b.K - 1) / b.K | 0);
  return {dev:b.dev, ino:b.ino, mode:b.mode, nlink:b.nlink, uid:b.uid, gid:b.gid, rdev:b.rdev, size:b.size, atime:b.atime, mtime:b.mtime, ctime:b.ctime, K:b.K, blocks:b.blocks};
}, p:function(a, b) {
  var c = P.A(a);
  try {
    void 0 !== b.mode && (fs.chmodSync(c, b.mode), a.mode = b.mode), void 0 !== b.size && fs.truncateSync(c, b.size);
  } catch (d) {
    if (!d.code) {
      throw d;
    }
    throw new M(J[d.code]);
  }
}, lookup:function(a, b) {
  var c = K(P.A(a), b), c = P.Ja(c);
  return P.createNode(a, b, c);
}, T:function(a, b, c, d) {
  a = P.createNode(a, b, c, d);
  b = P.A(a);
  try {
    O(a.mode) ? fs.mkdirSync(b, a.mode) : fs.writeFileSync(b, "", {mode:a.mode});
  } catch (f) {
    if (!f.code) {
      throw f;
    }
    throw new M(J[f.code]);
  }
  return a;
}, rename:function(a, b, c) {
  a = P.A(a);
  b = K(P.A(b), c);
  try {
    fs.renameSync(a, b);
  } catch (d) {
    if (!d.code) {
      throw d;
    }
    throw new M(J[d.code]);
  }
}, unlink:function(a, b) {
  var c = K(P.A(a), b);
  try {
    fs.unlinkSync(c);
  } catch (d) {
    if (!d.code) {
      throw d;
    }
    throw new M(J[d.code]);
  }
}, rmdir:function(a, b) {
  var c = K(P.A(a), b);
  try {
    fs.rmdirSync(c);
  } catch (d) {
    if (!d.code) {
      throw d;
    }
    throw new M(J[d.code]);
  }
}, readdir:function(a) {
  a = P.A(a);
  try {
    return fs.readdirSync(a);
  } catch (b) {
    if (!b.code) {
      throw b;
    }
    throw new M(J[b.code]);
  }
}, symlink:function(a, b, c) {
  a = K(P.A(a), b);
  try {
    fs.symlinkSync(c, a);
  } catch (d) {
    if (!d.code) {
      throw d;
    }
    throw new M(J[d.code]);
  }
}, readlink:function(a) {
  var b = P.A(a);
  try {
    return b = fs.readlinkSync(b), b = Fb.relative(Fb.resolve(a.u.pa.root), b);
  } catch (c) {
    if (!c.code) {
      throw c;
    }
    throw new M(J[c.code]);
  }
}}, n:{open:function(a) {
  var b = P.A(a.g);
  try {
    32768 === (a.g.mode & 61440) && (a.V = fs.openSync(b, P.$a(a.flags)));
  } catch (c) {
    if (!c.code) {
      throw c;
    }
    throw new M(J[c.code]);
  }
}, close:function(a) {
  try {
    32768 === (a.g.mode & 61440) && a.V && fs.closeSync(a.V);
  } catch (b) {
    if (!b.code) {
      throw b;
    }
    throw new M(J[b.code]);
  }
}, read:function(a, b, c, d, f) {
  if (0 === d) {
    return 0;
  }
  var g = new Buffer(d), h;
  try {
    h = fs.readSync(a.V, g, 0, d, f);
  } catch (l) {
    throw new M(J[l.code]);
  }
  if (0 < h) {
    for (a = 0;a < h;a++) {
      b[c + a] = g[a];
    }
  }
  return h;
}, write:function(a, b, c, d, f) {
  b = new Buffer(b.subarray(c, c + d));
  var g;
  try {
    g = fs.writeSync(a.V, b, 0, d, f);
  } catch (h) {
    throw new M(J[h.code]);
  }
  return g;
}, G:function(a, b, c) {
  if (1 === c) {
    b += a.position;
  } else {
    if (2 === c && 32768 === (a.g.mode & 61440)) {
      try {
        b += fs.fstatSync(a.V).size;
      } catch (d) {
        throw new M(J[d.code]);
      }
    }
  }
  if (0 > b) {
    throw new M(J.q);
  }
  return b;
}}};
C(1, "i32*", 2);
C(1, "i32*", 2);
C(1, "i32*", 2);
var Gb = null, Hb = [null], Ib = [], Jb = 1, Q = null, Kb = !0, R = {}, M = null, Db = {};
function S(a, b) {
  a = ub("/", a);
  b = b || {};
  if (!a) {
    return {path:"", g:null};
  }
  var c = {Ia:!0, ra:0}, d;
  for (d in c) {
    void 0 === b[d] && (b[d] = c[d]);
  }
  if (8 < b.ra) {
    throw new M(J.ga);
  }
  var c = pb(a.split("/").filter(function(a) {
    return !!a;
  }), !1), f = Gb;
  d = "/";
  for (var g = 0;g < c.length;g++) {
    var h = g === c.length - 1;
    if (h && b.parent) {
      break;
    }
    f = Eb(f, c[g]);
    d = K(d, c[g]);
    f.U && (!h || h && b.Ia) && (f = f.U.root);
    if (!h || b.la) {
      for (h = 0;40960 === (f.mode & 61440);) {
        if (f = Lb(d), d = ub(rb(d), f), f = S(d, {ra:b.ra}).g, 40 < h++) {
          throw new M(J.ga);
        }
      }
    }
  }
  return {path:d, g:f};
}
function T(a) {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.u.Oa, b ? "/" !== a[a.length - 1] ? a + "/" + b : a + b : a;
    }
    b = b ? a.name + "/" + b : a.name;
    a = a.parent;
  }
}
function Mb(a, b) {
  for (var c = 0, d = 0;d < b.length;d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % Q.length;
}
function Ob(a) {
  var b = Mb(a.parent.id, a.name);
  a.M = Q[b];
  Q[b] = a;
}
function Eb(a, b) {
  var c;
  if (c = (c = Pb(a, "x")) ? c : a.k.lookup ? 0 : J.da) {
    throw new M(c, a);
  }
  for (c = Q[Mb(a.id, b)];c;c = c.M) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.k.lookup(a, b);
}
function Cb(a, b, c, d) {
  Qb || (Qb = function(a, b, c, d) {
    a || (a = this);
    this.parent = a;
    this.u = a.u;
    this.U = null;
    this.id = Jb++;
    this.name = b;
    this.mode = c;
    this.k = {};
    this.n = {};
    this.rdev = d;
  }, Qb.prototype = {}, Object.defineProperties(Qb.prototype, {read:{get:function() {
    return 365 === (this.mode & 365);
  }, set:function(a) {
    a ? this.mode |= 365 : this.mode &= -366;
  }}, write:{get:function() {
    return 146 === (this.mode & 146);
  }, set:function(a) {
    a ? this.mode |= 146 : this.mode &= -147;
  }}, kb:{get:function() {
    return O(this.mode);
  }}, jb:{get:function() {
    return 8192 === (this.mode & 61440);
  }}}));
  a = new Qb(a, b, c, d);
  Ob(a);
  return a;
}
function O(a) {
  return 16384 === (a & 61440);
}
var Rb = {r:0, rs:1052672, "r+":2, w:577, wx:705, xw:705, "w+":578, "wx+":706, "xw+":706, a:1089, ax:1217, xa:1217, "a+":1090, "ax+":1218, "xa+":1218};
function Pb(a, b) {
  if (Kb) {
    return 0;
  }
  if (-1 === b.indexOf("r") || a.mode & 292) {
    if (-1 !== b.indexOf("w") && !(a.mode & 146) || -1 !== b.indexOf("x") && !(a.mode & 73)) {
      return J.da;
    }
  } else {
    return J.da;
  }
  return 0;
}
function Sb(a, b) {
  try {
    return Eb(a, b), J.wa;
  } catch (c) {
  }
  return Pb(a, "wx");
}
function Tb() {
  var a;
  a = 4096;
  for (var b = 0;b <= a;b++) {
    if (!Ib[b]) {
      return b;
    }
  }
  throw new M(J.Sa);
}
function Ub(a) {
  Vb || (Vb = function() {
  }, Vb.prototype = {}, Object.defineProperties(Vb.prototype, {object:{get:function() {
    return this.g;
  }, set:function(a) {
    this.g = a;
  }}, Kd:{get:function() {
    return 1 !== (this.flags & 2097155);
  }}, Ld:{get:function() {
    return 0 !== (this.flags & 2097155);
  }}, Jd:{get:function() {
    return this.flags & 1024;
  }}}));
  var b = new Vb, c;
  for (c in a) {
    b[c] = a[c];
  }
  a = b;
  b = Tb();
  a.fd = b;
  return Ib[b] = a;
}
var Bb = {open:function(a) {
  a.n = Hb[a.g.rdev].n;
  a.n.open && a.n.open(a);
}, G:function() {
  throw new M(J.ia);
}};
function xb(a, b) {
  Hb[a] = {n:b};
}
function Wb(a, b) {
  var c = "/" === b, d = !b, f;
  if (c && Gb) {
    throw new M(J.fa);
  }
  if (!c && !d) {
    f = S(b, {Ia:!1});
    b = f.path;
    f = f.g;
    if (f.U) {
      throw new M(J.fa);
    }
    if (!O(f.mode)) {
      throw new M(J.ya);
    }
  }
  var d = {type:a, pa:{}, Oa:b, lb:[]}, g = a.u(d);
  g.u = d;
  d.root = g;
  c ? Gb = g : f && (f.U = d, f.u && f.u.lb.push(d));
}
function Xb(a, b, c) {
  var d = S(a, {parent:!0}).g;
  a = sb(a);
  if (!a || "." === a || ".." === a) {
    throw new M(J.q);
  }
  var f = Sb(d, a);
  if (f) {
    throw new M(f);
  }
  if (!d.k.T) {
    throw new M(J.I);
  }
  return d.k.T(d, a, b, c);
}
function Yb(a, b) {
  b = (void 0 !== b ? b : 438) & 4095;
  b |= 32768;
  return Xb(a, b, 0);
}
function V(a, b) {
  b = (void 0 !== b ? b : 511) & 1023;
  b |= 16384;
  return Xb(a, b, 0);
}
function Zb(a, b, c) {
  "undefined" === typeof c && (c = b, b = 438);
  return Xb(a, b | 8192, c);
}
function $b(a, b) {
  if (!ub(a)) {
    throw new M(J.D);
  }
  var c = S(b, {parent:!0}).g;
  if (!c) {
    throw new M(J.D);
  }
  var d = sb(b), f = Sb(c, d);
  if (f) {
    throw new M(f);
  }
  if (!c.k.symlink) {
    throw new M(J.I);
  }
  return c.k.symlink(c, d, a);
}
function Lb(a) {
  a = S(a).g;
  if (!a) {
    throw new M(J.D);
  }
  if (!a.k.readlink) {
    throw new M(J.q);
  }
  return ub(T(a.parent), a.k.readlink(a));
}
function ac(a, b) {
  var c;
  "string" === typeof a ? c = S(a, {la:!0}).g : c = a;
  if (!c.k.p) {
    throw new M(J.I);
  }
  c.k.p(c, {mode:b & 4095 | c.mode & -4096, timestamp:Date.now()});
}
function bc(a, b) {
  var c;
  if ("" === a) {
    throw new M(J.D);
  }
  var d;
  if ("string" === typeof b) {
    if (d = Rb[b], "undefined" === typeof d) {
      throw Error("Unknown file open mode: " + b);
    }
  } else {
    d = b;
  }
  b = d;
  c = b & 64 ? ("undefined" === typeof c ? 438 : c) & 4095 | 32768 : 0;
  var f;
  if ("object" === typeof a) {
    f = a;
  } else {
    a = qb(a);
    try {
      f = S(a, {la:!(b & 131072)}).g;
    } catch (g) {
    }
  }
  d = !1;
  if (b & 64) {
    if (f) {
      if (b & 128) {
        throw new M(J.wa);
      }
    } else {
      f = Xb(a, c, 0), d = !0;
    }
  }
  if (!f) {
    throw new M(J.D);
  }
  8192 === (f.mode & 61440) && (b &= -513);
  if (b & 65536 && !O(f.mode)) {
    throw new M(J.ya);
  }
  if (!d && (f ? 40960 === (f.mode & 61440) ? c = J.ga : O(f.mode) && (0 !== (b & 2097155) || b & 512) ? c = J.P : (c = ["r", "w", "rw"][b & 3], b & 512 && (c += "w"), c = Pb(f, c)) : c = J.D, c)) {
    throw new M(c);
  }
  if (b & 512) {
    c = f;
    var h;
    "string" === typeof c ? h = S(c, {la:!0}).g : h = c;
    if (!h.k.p) {
      throw new M(J.I);
    }
    if (O(h.mode)) {
      throw new M(J.P);
    }
    if (32768 !== (h.mode & 61440)) {
      throw new M(J.q);
    }
    if (c = Pb(h, "w")) {
      throw new M(c);
    }
    h.k.p(h, {size:0, timestamp:Date.now()});
  }
  b &= -641;
  f = Ub({g:f, path:T(f), flags:b, seekable:!0, position:0, n:f.n, tb:[], error:!1});
  f.n.open && f.n.open(f);
  !e.logReadFiles || b & 1 || (cc || (cc = {}), a in cc || (cc[a] = 1, e.printErr("read file: " + a)));
  try {
    R.onOpenFile && (h = 0, 1 !== (b & 2097155) && (h |= 1), 0 !== (b & 2097155) && (h |= 2), R.onOpenFile(a, h));
  } catch (l) {
    console.log("FS.trackingDelegate['onOpenFile']('" + a + "', flags) threw an exception: " + l.message);
  }
  return f;
}
function dc(a) {
  a.na && (a.na = null);
  try {
    a.n.close && a.n.close(a);
  } catch (b) {
    throw b;
  } finally {
    Ib[a.fd] = null;
  }
}
function ec(a, b, c) {
  if (!a.seekable || !a.n.G) {
    throw new M(J.ia);
  }
  a.position = a.n.G(a, b, c);
  a.tb = [];
}
function fc(a, b, c, d, f, g) {
  if (0 > d || 0 > f) {
    throw new M(J.q);
  }
  if (0 === (a.flags & 2097155)) {
    throw new M(J.ea);
  }
  if (O(a.g.mode)) {
    throw new M(J.P);
  }
  if (!a.n.write) {
    throw new M(J.q);
  }
  a.flags & 1024 && ec(a, 0, 2);
  var h = !0;
  if ("undefined" === typeof f) {
    f = a.position, h = !1;
  } else {
    if (!a.seekable) {
      throw new M(J.ia);
    }
  }
  b = a.n.write(a, b, c, d, f, g);
  h || (a.position += b);
  try {
    if (a.path && R.onWriteToFile) {
      R.onWriteToFile(a.path);
    }
  } catch (l) {
    console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + l.message);
  }
  return b;
}
function gc() {
  M || (M = function(a, b) {
    this.g = b;
    this.qb = function(a) {
      this.S = a;
      for (var b in J) {
        if (J[b] === a) {
          this.code = b;
          break;
        }
      }
    };
    this.qb(a);
    this.message = ob[a];
  }, M.prototype = Error(), M.prototype.constructor = M, [J.D].forEach(function(a) {
    Db[a] = new M(a);
    Db[a].stack = "<generic error, no stack>";
  }));
}
var hc;
function ic(a, b) {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}
function jc(a, b, c, d) {
  a = K("string" === typeof a ? a : T(a), b);
  return Yb(a, ic(c, d));
}
function kc(a, b, c, d, f, g) {
  a = b ? K("string" === typeof a ? a : T(a), b) : a;
  d = ic(d, f);
  f = Yb(a, d);
  if (c) {
    if ("string" === typeof c) {
      a = Array(c.length);
      b = 0;
      for (var h = c.length;b < h;++b) {
        a[b] = c.charCodeAt(b);
      }
      c = a;
    }
    ac(f, d | 146);
    a = bc(f, "w");
    fc(a, c, 0, c.length, 0, g);
    dc(a);
    ac(f, d);
  }
  return f;
}
function W(a, b, c, d) {
  a = K("string" === typeof a ? a : T(a), b);
  b = ic(!!c, !!d);
  W.Ma || (W.Ma = 64);
  var f = W.Ma++ << 8 | 0;
  xb(f, {open:function(a) {
    a.seekable = !1;
  }, close:function() {
    d && d.buffer && d.buffer.length && d(10);
  }, read:function(a, b, d, f) {
    for (var r = 0, p = 0;p < f;p++) {
      var t;
      try {
        t = c();
      } catch (z) {
        throw new M(J.H);
      }
      if (void 0 === t && 0 === r) {
        throw new M(J.va);
      }
      if (null === t || void 0 === t) {
        break;
      }
      r++;
      b[d + p] = t;
    }
    r && (a.g.timestamp = Date.now());
    return r;
  }, write:function(a, b, c, f) {
    for (var r = 0;r < f;r++) {
      try {
        d(b[c + r]);
      } catch (p) {
        throw new M(J.H);
      }
    }
    f && (a.g.timestamp = Date.now());
    return r;
  }});
  return Zb(a, b, f);
}
function lc(a) {
  if (a.jb || a.kb || a.link || a.e) {
    return !0;
  }
  var b = !0;
  if ("undefined" !== typeof XMLHttpRequest) {
    throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  }
  if (e.read) {
    try {
      a.e = db(e.read(a.url), !0), a.o = a.e.length;
    } catch (c) {
      b = !1;
    }
  } else {
    throw Error("Cannot load without read() or XMLHttpRequest.");
  }
  b || jb(J.H);
  return b;
}
var mc = {}, Qb, Vb, cc, nc = 0;
function X() {
  nc += 4;
  return B[nc - 4 >> 2];
}
function oc() {
  var a;
  a = X();
  a = Ib[a];
  if (!a) {
    throw new M(J.ea);
  }
  return a;
}
function Fa(a) {
  Fa.F || (q = Pa(), Fa.F = !0, assert(n.R), Fa.bb = n.R, n.R = function() {
    v("cannot dynamically allocate, sbrk now has control");
  });
  var b = q;
  return 0 == a || Fa.bb(a) ? b : 4294967295;
}
e._memcpy = pc;
function qc(a, b) {
  rc = a;
  sc = b;
  if (!tc) {
    return 1;
  }
  if (0 == a) {
    Y = function() {
      setTimeout(uc, b);
    }, vc = "timeout";
  } else {
    if (1 == a) {
      Y = function() {
        wc(uc);
      }, vc = "rAF";
    } else {
      if (2 == a) {
        if (!window.setImmediate) {
          var c = [];
          window.addEventListener("message", function(a) {
            a.source === window && "__emcc" === a.data && (a.stopPropagation(), c.shift()());
          }, !0);
          window.setImmediate = function(a) {
            c.push(a);
            window.postMessage("__emcc", "*");
          };
        }
        Y = function() {
          window.setImmediate(uc);
        };
        vc = "immediate";
      }
    }
  }
  return 0;
}
function xc(a, b, c, d, f) {
  e.noExitRuntime = !0;
  assert(!tc, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
  tc = a;
  yc = d;
  var g = zc;
  uc = function() {
    if (!w) {
      if (0 < Ac.length) {
        var b = Date.now(), c = Ac.shift();
        c.ab(c.X);
        if (Bc) {
          var f = Bc, r = 0 == f % 1 ? f - 1 : Math.floor(f);
          Bc = c.Ad ? r : (8 * f + (r + .5)) / 9;
        }
        console.log('main loop blocker "' + c.name + '" took ' + (Date.now() - b) + " ms");
        Cc();
        setTimeout(uc, 0);
      } else {
        g < zc || (Dc = Dc + 1 | 0, 1 == rc && 1 < sc && 0 != Dc % sc ? Y() : ("timeout" === vc && e.ka && (e.W("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!"), vc = ""), Ec(function() {
          "undefined" !== typeof d ? n.L("vi", a, [d]) : n.L("v", a);
        }), g < zc || ("object" === typeof SDL && SDL.audio && SDL.audio.mb && SDL.audio.mb(), Y())));
      }
    }
  };
  f || (b && 0 < b ? qc(0, 1E3 / b) : qc(1, 1), Y());
  if (c) {
    throw "SimulateInfiniteLoop";
  }
}
var Y = null, vc = "", zc = 0, tc = null, yc = 0, rc = 0, sc = 0, Dc = 0, Ac = [];
function Cc() {
  if (e.setStatus) {
    var a = e.statusMessage || "Please wait...", b = Bc, c = Fc.Cd;
    b ? b < c ? e.setStatus(a + " (" + (c - b) + "/" + c + ")") : e.setStatus(a) : e.setStatus("");
  }
}
function Ec(a) {
  if (!(w || e.preMainLoop && !1 === e.preMainLoop())) {
    try {
      a();
    } catch (b) {
      if (b instanceof ia) {
        return;
      }
      b && "object" === typeof b && b.stack && e.W("exception thrown: " + [b, b.stack]);
      throw b;
    }
    e.postMainLoop && e.postMainLoop();
  }
}
var Fc = {}, uc, Bc, Gc = !1, Hc = !1, Ic = [];
function Jc() {
  function a() {
    Hc = document.pointerLockElement === c || document.mozPointerLockElement === c || document.webkitPointerLockElement === c || document.msPointerLockElement === c;
  }
  e.preloadPlugins || (e.preloadPlugins = []);
  if (!Kc) {
    Kc = !0;
    try {
      Lc = !0;
    } catch (b) {
      Lc = !1, console.log("warning: no blob constructor, cannot create blobs with mimetypes");
    }
    Mc = "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : "undefined" != typeof WebKitBlobBuilder ? WebKitBlobBuilder : Lc ? null : console.log("warning: no BlobBuilder");
    Nc = "undefined" != typeof window ? window.URL ? window.URL : window.webkitURL : void 0;
    e.Qa || "undefined" !== typeof Nc || (console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."), e.Qa = !0);
    e.preloadPlugins.push({canHandle:function(a) {
      return !e.Qa && /\.(jpg|jpeg|png|bmp)$/i.test(a);
    }, handle:function(a, b, c, h) {
      var l = null;
      if (Lc) {
        try {
          l = new Blob([a], {type:Oc(b)}), l.size !== a.length && (l = new Blob([(new Uint8Array(a)).buffer], {type:Oc(b)}));
        } catch (u) {
          n.O("Blob constructor present but fails: " + u + "; falling back to blob builder");
        }
      }
      l || (l = new Mc, l.append((new Uint8Array(a)).buffer), l = l.getBlob());
      var r = Nc.createObjectURL(l), p = new Image;
      p.onload = function() {
        assert(p.complete, "Image " + b + " could not be decoded");
        var h = document.createElement("canvas");
        h.width = p.width;
        h.height = p.height;
        h.getContext("2d").drawImage(p, 0, 0);
        e.preloadedImages[b] = h;
        Nc.revokeObjectURL(r);
        c && c(a);
      };
      p.onerror = function() {
        console.log("Image " + r + " could not be decoded");
        h && h();
      };
      p.src = r;
    }});
    e.preloadPlugins.push({canHandle:function(a) {
      return !e.Od && a.substr(-4) in {".ogg":1, ".wav":1, ".mp3":1};
    }, handle:function(a, b, c, h) {
      function l(h) {
        r || (r = !0, e.preloadedAudios[b] = h, c && c(a));
      }
      function u() {
        r || (r = !0, e.preloadedAudios[b] = new Audio, h && h());
      }
      var r = !1;
      if (Lc) {
        try {
          var p = new Blob([a], {type:Oc(b)});
        } catch (t) {
          return u();
        }
        var p = Nc.createObjectURL(p), z = new Audio;
        z.addEventListener("canplaythrough", function() {
          l(z);
        }, !1);
        z.onerror = function() {
          if (!r) {
            console.log("warning: browser could not fully decode audio " + b + ", trying slower base64 approach");
            for (var c = "", g = 0, h = 0, p = 0;p < a.length;p++) {
              for (g = g << 8 | a[p], h += 8;6 <= h;) {
                var t = g >> h - 6 & 63, h = h - 6, c = c + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[t]
              }
            }
            2 == h ? (c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[(g & 3) << 4], c += "==") : 4 == h && (c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[(g & 15) << 2], c += "=");
            z.src = "data:audio/x-" + b.substr(-3) + ";base64," + c;
            l(z);
          }
        };
        z.src = p;
        Pc(function() {
          l(z);
        });
      } else {
        return u();
      }
    }});
    var c = e.canvas;
    c && (c.sa = c.requestPointerLock || c.mozRequestPointerLock || c.webkitRequestPointerLock || c.msRequestPointerLock || function() {
    }, c.Fa = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {
    }, c.Fa = c.Fa.bind(document), document.addEventListener("pointerlockchange", a, !1), document.addEventListener("mozpointerlockchange", a, !1), document.addEventListener("webkitpointerlockchange", a, !1), document.addEventListener("mspointerlockchange", a, !1), e.elementPointerLock && c.addEventListener("click", function(a) {
      !Hc && c.sa && (c.sa(), a.preventDefault());
    }, !1));
  }
}
function Qc(a, b, c, d) {
  if (b && e.ka && a == e.canvas) {
    return e.ka;
  }
  var f, g;
  if (b) {
    g = {antialias:!1, alpha:!1};
    if (d) {
      for (var h in d) {
        g[h] = d[h];
      }
    }
    if (g = GL.createContext(a, g)) {
      f = GL.getContext(g).td;
    }
    a.style.backgroundColor = "black";
  } else {
    f = a.getContext("2d");
  }
  if (!f) {
    return null;
  }
  c && (b || assert("undefined" === typeof GLctx, "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"), e.ka = f, b && GL.Nd(g), e.Rd = b, Ic.forEach(function(a) {
    a();
  }), Jc());
  return f;
}
var Rc = !1, Sc = void 0, Tc = void 0;
function Uc(a, b, c) {
  function d() {
    Gc = !1;
    var a = f.parentNode;
    (document.webkitFullScreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.mozFullscreenElement || document.fullScreenElement || document.fullscreenElement || document.msFullScreenElement || document.msFullscreenElement || document.webkitCurrentFullScreenElement) === a ? (f.Da = document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen || document.exitFullscreen || function() {
    }, f.Da = f.Da.bind(document), Sc && f.sa(), Gc = !0, Tc && Vc()) : (a.parentNode.insertBefore(f, a), a.parentNode.removeChild(a), Tc && Wc());
    if (e.onFullScreen) {
      e.onFullScreen(Gc);
    }
    Xc(f);
  }
  Sc = a;
  Tc = b;
  Yc = c;
  "undefined" === typeof Sc && (Sc = !0);
  "undefined" === typeof Tc && (Tc = !1);
  "undefined" === typeof Yc && (Yc = null);
  var f = e.canvas;
  Rc || (Rc = !0, document.addEventListener("fullscreenchange", d, !1), document.addEventListener("mozfullscreenchange", d, !1), document.addEventListener("webkitfullscreenchange", d, !1), document.addEventListener("MSFullscreenChange", d, !1));
  var g = document.createElement("div");
  f.parentNode.insertBefore(g, f);
  g.appendChild(f);
  g.F = g.requestFullScreen || g.mozRequestFullScreen || g.msRequestFullscreen || (g.webkitRequestFullScreen ? function() {
    g.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } : null);
  c ? g.F({Sd:c}) : g.F();
}
var Zc = 0;
function $c(a) {
  var b = Date.now();
  if (0 === Zc) {
    Zc = b + 1E3 / 60;
  } else {
    for (;b + 2 >= Zc;) {
      Zc += 1E3 / 60;
    }
  }
  b = Math.max(Zc - b, 0);
  setTimeout(a, b);
}
function wc(a) {
  "undefined" === typeof window ? $c(a) : (window.requestAnimationFrame || (window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || $c), window.requestAnimationFrame(a));
}
function Pc(a) {
  e.noExitRuntime = !0;
  setTimeout(function() {
    w || a();
  }, 1E4);
}
function Oc(a) {
  return {jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", bmp:"image/bmp", ogg:"audio/ogg", wav:"audio/wav", mp3:"audio/mpeg"}[a.substr(a.lastIndexOf(".") + 1)];
}
function ad(a, b, c) {
  var d = new XMLHttpRequest;
  d.open("GET", a, !0);
  d.responseType = "arraybuffer";
  d.onload = function() {
    200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
  };
  d.onerror = c;
  d.send(null);
}
function bd(a, b, c) {
  ad(a, function(c) {
    assert(c, 'Loading data file "' + a + '" failed (no arrayBuffer).');
    b(new Uint8Array(c));
    hb();
  }, function() {
    if (c) {
      c();
    } else {
      throw 'Loading data file "' + a + '" failed.';
    }
  });
  gb();
}
var cd = [];
function dd() {
  var a = e.canvas;
  cd.forEach(function(b) {
    b(a.width, a.height);
  });
}
function Vc() {
  if ("undefined" != typeof SDL) {
    var a = Ra[SDL.screen + 0 * n.J >> 2];
    B[SDL.screen + 0 * n.J >> 2] = a | 8388608;
  }
  dd();
}
function Wc() {
  if ("undefined" != typeof SDL) {
    var a = Ra[SDL.screen + 0 * n.J >> 2];
    B[SDL.screen + 0 * n.J >> 2] = a & -8388609;
  }
  dd();
}
function Xc(a, b, c) {
  b && c ? (a.ub = b, a.hb = c) : (b = a.ub, c = a.hb);
  var d = b, f = c;
  e.forcedAspectRatio && 0 < e.forcedAspectRatio && (d / f < e.forcedAspectRatio ? d = Math.round(f * e.forcedAspectRatio) : f = Math.round(d / e.forcedAspectRatio));
  if ((document.webkitFullScreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.mozFullscreenElement || document.fullScreenElement || document.fullscreenElement || document.msFullScreenElement || document.msFullscreenElement || document.webkitCurrentFullScreenElement) === a.parentNode && "undefined" != typeof screen) {
    var g = Math.min(screen.width / d, screen.height / f), d = Math.round(d * g), f = Math.round(f * g)
  }
  Tc ? (a.width != d && (a.width = d), a.height != f && (a.height = f), "undefined" != typeof a.style && (a.style.removeProperty("width"), a.style.removeProperty("height"))) : (a.width != b && (a.width = b), a.height != c && (a.height = c), "undefined" != typeof a.style && (d != b || f != c ? (a.style.setProperty("width", d + "px", "important"), a.style.setProperty("height", f + "px", "important")) : (a.style.removeProperty("width"), a.style.removeProperty("height"))));
}
var Kc, Lc, Mc, Nc, Yc;
gc();
Q = Array(4096);
Wb(N, "/");
V("/tmp");
V("/home");
V("/home/web_user");
(function() {
  V("/dev");
  xb(259, {read:function() {
    return 0;
  }, write:function(a, b, f, g) {
    return g;
  }});
  Zb("/dev/null", 259);
  wb(1280, zb);
  wb(1536, Ab);
  Zb("/dev/tty", 1280);
  Zb("/dev/tty1", 1536);
  var a;
  if ("undefined" !== typeof crypto) {
    var b = new Uint8Array(1);
    a = function() {
      crypto.getRandomValues(b);
      return b[0];
    };
  } else {
    a = da ? function() {
      return require("crypto").randomBytes(1)[0];
    } : function() {
      return 256 * Math.random() | 0;
    };
  }
  W("/dev", "random", a);
  W("/dev", "urandom", a);
  V("/dev/shm");
  V("/dev/shm/tmp");
})();
V("/proc");
V("/proc/self");
V("/proc/self/fd");
Wb({u:function() {
  var a = Cb("/proc/self", "fd", 16895, 73);
  a.k = {lookup:function(a, c) {
    var d = Ib[+c];
    if (!d) {
      throw new M(J.ea);
    }
    var f = {parent:null, u:{Oa:"fake"}, k:{readlink:function() {
      return d.path;
    }}};
    return f.parent = f;
  }};
  return a;
}}, "/proc/self/fd");
Za.unshift(function() {
  if (!e.noFSInit && !hc) {
    assert(!hc, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
    hc = !0;
    gc();
    e.stdin = e.stdin;
    e.stdout = e.stdout;
    e.stderr = e.stderr;
    e.stdin ? W("/dev", "stdin", e.stdin) : $b("/dev/tty", "/dev/stdin");
    e.stdout ? W("/dev", "stdout", null, e.stdout) : $b("/dev/tty", "/dev/stdout");
    e.stderr ? W("/dev", "stderr", null, e.stderr) : $b("/dev/tty1", "/dev/stderr");
    var a = bc("/dev/stdin", "r");
    assert(0 === a.fd, "invalid handle for stdin (" + a.fd + ")");
    a = bc("/dev/stdout", "w");
    assert(1 === a.fd, "invalid handle for stdout (" + a.fd + ")");
    a = bc("/dev/stderr", "w");
    assert(2 === a.fd, "invalid handle for stderr (" + a.fd + ")");
  }
});
$a.push(function() {
  Kb = !1;
});
H.push(function() {
  hc = !1;
  var a = e._fflush;
  a && a(0);
  for (a = 0;a < Ib.length;a++) {
    var b = Ib[a];
    b && dc(b);
  }
});
e.FS_createFolder = function(a, b, c, d) {
  a = K("string" === typeof a ? a : T(a), b);
  return V(a, ic(c, d));
};
e.FS_createPath = function(a, b) {
  a = "string" === typeof a ? a : T(a);
  for (var c = b.split("/").reverse();c.length;) {
    var d = c.pop();
    if (d) {
      var f = K(a, d);
      try {
        V(f);
      } catch (g) {
      }
      a = f;
    }
  }
  return f;
};
e.FS_createDataFile = kc;
e.FS_createPreloadedFile = function(a, b, c, d, f, g, h, l, u, r) {
  function p(c) {
    function p(c) {
      r && r();
      l || kc(a, b, c, d, f, u);
      g && g();
      hb();
    }
    var L = !1;
    e.preloadPlugins.forEach(function(a) {
      !L && a.canHandle(t) && (a.handle(c, t, p, function() {
        h && h();
        hb();
      }), L = !0);
    });
    L || p(c);
  }
  Jc();
  var t = b ? ub(K(a, b)) : a;
  gb();
  "string" == typeof c ? bd(c, function(a) {
    p(a);
  }, h) : p(c);
};
e.FS_createLazyFile = function(a, b, c, d, f) {
  var g, h;
  function l() {
    this.oa = !1;
    this.Y = [];
  }
  l.prototype.get = function(a) {
    if (!(a > this.length - 1 || 0 > a)) {
      var b = a % this.chunkSize;
      return this.gb(a / this.chunkSize | 0)[b];
    }
  };
  l.prototype.pb = function(a) {
    this.gb = a;
  };
  l.prototype.Ca = function() {
    var a = new XMLHttpRequest;
    a.open("HEAD", c, !1);
    a.send(null);
    if (!(200 <= a.status && 300 > a.status || 304 === a.status)) {
      throw Error("Couldn't load " + c + ". Status: " + a.status);
    }
    var b = Number(a.getResponseHeader("Content-length")), d, f = 1048576;
    (d = a.getResponseHeader("Accept-Ranges")) && "bytes" === d || (f = b);
    var g = this;
    g.pb(function(a) {
      var d = a * f, h = (a + 1) * f - 1, h = Math.min(h, b - 1);
      if ("undefined" === typeof g.Y[a]) {
        var l = g.Y;
        if (d > h) {
          throw Error("invalid range (" + d + ", " + h + ") or no bytes requested!");
        }
        if (h > b - 1) {
          throw Error("only " + b + " bytes available! programmer error!");
        }
        var p = new XMLHttpRequest;
        p.open("GET", c, !1);
        b !== f && p.setRequestHeader("Range", "bytes=" + d + "-" + h);
        "undefined" != typeof Uint8Array && (p.responseType = "arraybuffer");
        p.overrideMimeType && p.overrideMimeType("text/plain; charset=x-user-defined");
        p.send(null);
        if (!(200 <= p.status && 300 > p.status || 304 === p.status)) {
          throw Error("Couldn't load " + c + ". Status: " + p.status);
        }
        d = void 0 !== p.response ? new Uint8Array(p.response || []) : db(p.responseText || "", !0);
        l[a] = d;
      }
      if ("undefined" === typeof g.Y[a]) {
        throw Error("doXHR failed!");
      }
      return g.Y[a];
    });
    this.Wa = b;
    this.Va = f;
    this.oa = !0;
  };
  if ("undefined" !== typeof XMLHttpRequest) {
    if (!ca) {
      throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
    }
    g = new l;
    Object.defineProperty(g, "length", {get:function() {
      this.oa || this.Ca();
      return this.Wa;
    }});
    Object.defineProperty(g, "chunkSize", {get:function() {
      this.oa || this.Ca();
      return this.Va;
    }});
    h = void 0;
  } else {
    h = c, g = void 0;
  }
  var u = jc(a, b, d, f);
  g ? u.e = g : h && (u.e = null, u.url = h);
  Object.defineProperty(u, "usedBytes", {get:function() {
    return this.e.length;
  }});
  var r = {};
  Object.keys(u.n).forEach(function(a) {
    var b = u.n[a];
    r[a] = function() {
      if (!lc(u)) {
        throw new M(J.H);
      }
      return b.apply(null, arguments);
    };
  });
  r.read = function(a, b, c, d, f) {
    if (!lc(u)) {
      throw new M(J.H);
    }
    a = a.g.e;
    if (f >= a.length) {
      return 0;
    }
    d = Math.min(a.length - f, d);
    assert(0 <= d);
    if (a.slice) {
      for (var g = 0;g < d;g++) {
        b[c + g] = a[f + g];
      }
    } else {
      for (g = 0;g < d;g++) {
        b[c + g] = a.get(f + g);
      }
    }
    return d;
  };
  u.n = r;
  return u;
};
e.FS_createLink = function(a, b, c) {
  a = K("string" === typeof a ? a : T(a), b);
  return $b(c, a);
};
e.FS_createDevice = W;
e.FS_unlink = function(a) {
  var b = S(a, {parent:!0}).g, c = sb(a), d = Eb(b, c), f;
  a: {
    try {
      f = Eb(b, c);
    } catch (g) {
      f = g.S;
      break a;
    }
    var h = Pb(b, "wx");
    f = h ? h : O(f.mode) ? J.P : 0;
  }
  if (f) {
    throw f === J.P && (f = J.I), new M(f);
  }
  if (!b.k.unlink) {
    throw new M(J.I);
  }
  if (d.U) {
    throw new M(J.fa);
  }
  try {
    R.willDeletePath && R.willDeletePath(a);
  } catch (l) {
    console.log("FS.trackingDelegate['willDeletePath']('" + a + "') threw an exception: " + l.message);
  }
  b.k.unlink(b, c);
  b = Mb(d.parent.id, d.name);
  if (Q[b] === d) {
    Q[b] = d.M;
  } else {
    for (b = Q[b];b;) {
      if (b.M === d) {
        b.M = d.M;
        break;
      }
      b = b.M;
    }
  }
  try {
    if (R.onDeletePath) {
      R.onDeletePath(a);
    }
  } catch (u) {
    console.log("FS.trackingDelegate['onDeletePath']('" + a + "') threw an exception: " + u.message);
  }
};
Za.unshift(function() {
});
H.push(function() {
});
if (da) {
  var fs = require("fs"), Fb = require("path");
  P.sb();
}
e.requestFullScreen = function(a, b, c) {
  Uc(a, b, c);
};
e.requestAnimationFrame = function(a) {
  wc(a);
};
e.setCanvasSize = function(a, b, c) {
  Xc(e.canvas, a, b);
  c || dd();
};
e.pauseMainLoop = function() {
  Y = null;
  zc++;
};
e.resumeMainLoop = function() {
  zc++;
  var a = rc, b = sc, c = tc;
  tc = null;
  xc(c, 0, !1, yc, !0);
  qc(a, b);
  Y();
};
e.getUserMedia = function() {
  window.F || (window.F = navigator.getUserMedia || navigator.mozGetUserMedia);
  window.F(void 0);
};
e.createContext = function(a, b, c, d) {
  return Qc(a, b, c, d);
};
Ta = m = n.ja(la);
Ea = !0;
Ua = Ta + Wa;
Va = q = n.ja(Ua);
assert(Va < ma, "TOTAL_MEMORY not big enough for stack");
e.Ya = {Math:Math, Int8Array:Int8Array, Int16Array:Int16Array, Int32Array:Int32Array, Uint8Array:Uint8Array, Uint16Array:Uint16Array, Uint32Array:Uint32Array, Float32Array:Float32Array, Float64Array:Float64Array, NaN:NaN, Infinity:Infinity};
e.Za = {abort:v, assert:assert, invoke_ii:function(a, b) {
  try {
    return e.dynCall_ii(a, b);
  } catch (c) {
    if ("number" !== typeof c && "longjmp" !== c) {
      throw c;
    }
    Z.setThrew(1, 0);
  }
}, invoke_iiii:function(a, b, c, d) {
  try {
    return e.dynCall_iiii(a, b, c, d);
  } catch (f) {
    if ("number" !== typeof f && "longjmp" !== f) {
      throw f;
    }
    Z.setThrew(1, 0);
  }
}, invoke_vi:function(a, b) {
  try {
    e.dynCall_vi(a, b);
  } catch (c) {
    if ("number" !== typeof c && "longjmp" !== c) {
      throw c;
    }
    Z.setThrew(1, 0);
  }
}, _pthread_cleanup_pop:function() {
  assert(lb.level == H.length, "cannot pop if something else added meanwhile!");
  H.pop();
  lb.level = H.length;
}, ___lock:function() {
}, ___assert_fail:function(a, b, c, d) {
  w = !0;
  throw "Assertion failed: " + x(a) + ", at: " + [b ? x(b) : "unknown filename", c, d ? x(d) : "unknown function"] + " at " + Na();
}, _pthread_self:function() {
  return 0;
}, _emscripten_set_main_loop:xc, _abort:function() {
  e.abort();
}, _emscripten_set_main_loop_timing:qc, ___syscall6:function(a, b) {
  nc = b;
  try {
    var c = oc();
    dc(c);
    return 0;
  } catch (d) {
    return "undefined" !== typeof mc && d instanceof M || v(d), -d.S;
  }
}, _sbrk:Fa, _time:function(a) {
  var b = Date.now() / 1E3 | 0;
  a && (B[a >> 2] = b);
  return b;
}, ___setErrNo:jb, _emscripten_memcpy_big:function(a, b, c) {
  E.set(E.subarray(b, b + c), a);
  return a;
}, ___syscall54:function(a, b) {
  nc = b;
  try {
    var c = oc(), d = X();
    switch(d) {
      case 21505:
        return c.tty ? 0 : -J.Q;
      case 21506:
        return c.tty ? 0 : -J.Q;
      case 21519:
        if (!c.tty) {
          return -J.Q;
        }
        var f = X();
        return B[f >> 2] = 0;
      case 21520:
        return c.tty ? -J.q : -J.Q;
      case 21531:
        f = X();
        if (!c.n.ib) {
          throw new M(J.Q);
        }
        return c.n.ib(c, d, f);
      default:
        v("bad ioctl syscall " + d);
    }
  } catch (g) {
    return "undefined" !== typeof mc && g instanceof M || v(g), -g.S;
  }
}, ___unlock:function() {
}, ___syscall140:function(a, b) {
  nc = b;
  try {
    var c = oc(), d = X(), f = X(), g = X(), h = X();
    assert(0 === d);
    ec(c, f, h);
    B[g >> 2] = c.position;
    c.na && 0 === f && 0 === h && (c.na = null);
    return 0;
  } catch (l) {
    return "undefined" !== typeof mc && l instanceof M || v(l), -l.S;
  }
}, _pthread_cleanup_push:lb, _sysconf:function(a) {
  switch(a) {
    case 30:
      return 4096;
    case 85:
      return G / 4096;
    case 132:
    ;
    case 133:
    ;
    case 12:
    ;
    case 137:
    ;
    case 138:
    ;
    case 15:
    ;
    case 235:
    ;
    case 16:
    ;
    case 17:
    ;
    case 18:
    ;
    case 19:
    ;
    case 20:
    ;
    case 149:
    ;
    case 13:
    ;
    case 10:
    ;
    case 236:
    ;
    case 153:
    ;
    case 9:
    ;
    case 21:
    ;
    case 22:
    ;
    case 159:
    ;
    case 154:
    ;
    case 14:
    ;
    case 77:
    ;
    case 78:
    ;
    case 139:
    ;
    case 80:
    ;
    case 81:
    ;
    case 82:
    ;
    case 68:
    ;
    case 67:
    ;
    case 164:
    ;
    case 11:
    ;
    case 29:
    ;
    case 47:
    ;
    case 48:
    ;
    case 95:
    ;
    case 52:
    ;
    case 51:
    ;
    case 46:
      return 200809;
    case 79:
      return 0;
    case 27:
    ;
    case 246:
    ;
    case 127:
    ;
    case 128:
    ;
    case 23:
    ;
    case 24:
    ;
    case 160:
    ;
    case 161:
    ;
    case 181:
    ;
    case 182:
    ;
    case 242:
    ;
    case 183:
    ;
    case 184:
    ;
    case 243:
    ;
    case 244:
    ;
    case 245:
    ;
    case 165:
    ;
    case 178:
    ;
    case 179:
    ;
    case 49:
    ;
    case 50:
    ;
    case 168:
    ;
    case 169:
    ;
    case 175:
    ;
    case 170:
    ;
    case 171:
    ;
    case 172:
    ;
    case 97:
    ;
    case 76:
    ;
    case 32:
    ;
    case 173:
    ;
    case 35:
      return -1;
    case 176:
    ;
    case 177:
    ;
    case 7:
    ;
    case 155:
    ;
    case 8:
    ;
    case 157:
    ;
    case 125:
    ;
    case 126:
    ;
    case 92:
    ;
    case 93:
    ;
    case 129:
    ;
    case 130:
    ;
    case 131:
    ;
    case 94:
    ;
    case 91:
      return 1;
    case 74:
    ;
    case 60:
    ;
    case 69:
    ;
    case 70:
    ;
    case 4:
      return 1024;
    case 31:
    ;
    case 42:
    ;
    case 72:
      return 32;
    case 87:
    ;
    case 26:
    ;
    case 33:
      return 2147483647;
    case 34:
    ;
    case 1:
      return 47839;
    case 38:
    ;
    case 36:
      return 99;
    case 43:
    ;
    case 37:
      return 2048;
    case 0:
      return 2097152;
    case 3:
      return 65536;
    case 28:
      return 32768;
    case 44:
      return 32767;
    case 75:
      return 16384;
    case 39:
      return 1E3;
    case 89:
      return 700;
    case 71:
      return 256;
    case 40:
      return 255;
    case 2:
      return 100;
    case 180:
      return 64;
    case 25:
      return 20;
    case 5:
      return 16;
    case 6:
      return 6;
    case 73:
      return 4;
    case 84:
      return "object" === typeof navigator ? navigator.hardwareConcurrency || 1 : 1;
  }
  jb(J.q);
  return -1;
}, ___syscall146:function(a, b) {
  nc = b;
  try {
    var c = oc(), d = X(), f;
    a: {
      for (var g = X(), h = 0, l = 0;l < g;l++) {
        var u = fc(c, A, B[d + 8 * l >> 2], B[d + (8 * l + 4) >> 2], void 0);
        if (0 > u) {
          f = -1;
          break a;
        }
        h += u;
      }
      f = h;
    }
    return f;
  } catch (r) {
    return "undefined" !== typeof mc && r instanceof M || v(r), -r.S;
  }
}, STACKTOP:m, STACK_MAX:Ua, tempDoublePtr:ib, ABORT:w};
// EMSCRIPTEN_START_ASM

var Z = (function(global,env,buffer) {

  'use asm';
  
  
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);


  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var invoke_ii=env.invoke_ii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_vi=env.invoke_vi;
  var _pthread_cleanup_pop=env._pthread_cleanup_pop;
  var ___lock=env.___lock;
  var ___assert_fail=env.___assert_fail;
  var _pthread_self=env._pthread_self;
  var _emscripten_set_main_loop=env._emscripten_set_main_loop;
  var _abort=env._abort;
  var _emscripten_set_main_loop_timing=env._emscripten_set_main_loop_timing;
  var ___syscall6=env.___syscall6;
  var _sbrk=env._sbrk;
  var _time=env._time;
  var ___setErrNo=env.___setErrNo;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var ___syscall54=env.___syscall54;
  var ___unlock=env.___unlock;
  var ___syscall140=env.___syscall140;
  var _pthread_cleanup_push=env._pthread_cleanup_push;
  var _sysconf=env._sysconf;
  var ___syscall146=env.___syscall146;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS

function _malloc($bytes) {
 $bytes = $bytes | 0;
 var $$3$i = 0, $$lcssa = 0, $$lcssa211 = 0, $$lcssa215 = 0, $$lcssa216 = 0, $$lcssa217 = 0, $$lcssa219 = 0, $$lcssa222 = 0, $$lcssa224 = 0, $$lcssa226 = 0, $$lcssa228 = 0, $$lcssa230 = 0, $$lcssa232 = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i22$i = 0, $$pre$i25 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i23$iZ2D = 0;
 var $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre105 = 0, $$pre106 = 0, $$pre14$i$i = 0, $$pre43$i = 0, $$pre56$i$i = 0, $$pre57$i$i = 0, $$pre8$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0, $$sum$i13$i = 0, $$sum$i14$i = 0, $$sum$i17$i = 0, $$sum$i19$i = 0;
 var $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i15$i = 0, $$sum1$i20$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum11$i = 0, $$sum11$i$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0;
 var $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum121$i = 0, $$sum122$i = 0, $$sum123$i = 0, $$sum124$i = 0, $$sum125$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0;
 var $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i16$i = 0, $$sum2$i18$i = 0, $$sum2$i21$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0, $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i27 = 0;
 var $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0, $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0;
 var $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0;
 var $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0;
 var $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0;
 var $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0;
 var $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0;
 var $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0;
 var $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0;
 var $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0;
 var $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0;
 var $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0;
 var $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0;
 var $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0;
 var $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0;
 var $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0;
 var $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0;
 var $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0;
 var $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0;
 var $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0;
 var $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0;
 var $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0;
 var $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0;
 var $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0;
 var $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0;
 var $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0;
 var $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0;
 var $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0;
 var $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0;
 var $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0;
 var $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0;
 var $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0;
 var $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0;
 var $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0;
 var $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0;
 var $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0;
 var $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0;
 var $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0;
 var $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0;
 var $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0;
 var $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0;
 var $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0;
 var $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0;
 var $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0;
 var $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0;
 var $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0;
 var $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0;
 var $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0;
 var $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0;
 var $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0;
 var $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0;
 var $F5$0$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$029$i = 0, $K2$07$i$i = 0, $K8$051$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$lcssa = 0, $R$0$i$lcssa = 0, $R$0$i18 = 0, $R$0$i18$lcssa = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$lcssa = 0, $RP$0$i$lcssa = 0;
 var $RP$0$i17 = 0, $RP$0$i17$lcssa = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i25$i = 0, $T$028$i = 0, $T$028$i$lcssa = 0, $T$050$i$i = 0, $T$050$i$i$lcssa = 0, $T$06$i$i = 0, $T$06$i$i$lcssa = 0, $br$0$ph$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0;
 var $not$$i = 0, $not$$i$i = 0, $not$$i26$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i30 = 0, $or$cond1$i = 0, $or$cond19$i = 0, $or$cond2$i = 0, $or$cond3$i = 0, $or$cond5$i = 0, $or$cond57$i = 0, $or$cond6$i = 0, $or$cond8$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i$lcssa = 0, $rsize$0$i15 = 0, $rsize$1$i = 0;
 var $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$331$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$084$i = 0, $sp$084$i$lcssa = 0, $sp$183$i = 0, $sp$183$i$lcssa = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$ph$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0;
 var $t$2$v$3$i = 0, $t$230$i = 0, $tbase$255$i = 0, $tsize$0$ph$i = 0, $tsize$0323944$i = 0, $tsize$1$i = 0, $tsize$254$i = 0, $v$0$i = 0, $v$0$i$lcssa = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$3$ph$i = 0, $v$332$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $bytes >>> 0 < 245;
 do {
  if ($0) {
   $1 = $bytes >>> 0 < 11;
   $2 = $bytes + 11 | 0;
   $3 = $2 & -8;
   $4 = $1 ? 16 : $3;
   $5 = $4 >>> 3;
   $6 = HEAP32[376 >> 2] | 0;
   $7 = $6 >>> $5;
   $8 = $7 & 3;
   $9 = ($8 | 0) == 0;
   if (!$9) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = $11 + $5 | 0;
    $13 = $12 << 1;
    $14 = 416 + ($13 << 2) | 0;
    $$sum10 = $13 + 2 | 0;
    $15 = 416 + ($$sum10 << 2) | 0;
    $16 = HEAP32[$15 >> 2] | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $19 = ($14 | 0) == ($18 | 0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[376 >> 2] = $22;
     } else {
      $23 = HEAP32[392 >> 2] | 0;
      $24 = $18 >>> 0 < $23 >>> 0;
      if ($24) {
       _abort();
      }
      $25 = $18 + 12 | 0;
      $26 = HEAP32[$25 >> 2] | 0;
      $27 = ($26 | 0) == ($16 | 0);
      if ($27) {
       HEAP32[$25 >> 2] = $14;
       HEAP32[$15 >> 2] = $18;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = $16 + 4 | 0;
    HEAP32[$30 >> 2] = $29;
    $$sum1112 = $28 | 4;
    $31 = $16 + $$sum1112 | 0;
    $32 = HEAP32[$31 >> 2] | 0;
    $33 = $32 | 1;
    HEAP32[$31 >> 2] = $33;
    $mem$0 = $17;
    return $mem$0 | 0;
   }
   $34 = HEAP32[384 >> 2] | 0;
   $35 = $4 >>> 0 > $34 >>> 0;
   if ($35) {
    $36 = ($7 | 0) == 0;
    if (!$36) {
     $37 = $7 << $5;
     $38 = 2 << $5;
     $39 = 0 - $38 | 0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = 0 - $41 | 0;
     $43 = $41 & $42;
     $44 = $43 + -1 | 0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = $62 + $63 | 0;
     $65 = $64 << 1;
     $66 = 416 + ($65 << 2) | 0;
     $$sum4 = $65 + 2 | 0;
     $67 = 416 + ($$sum4 << 2) | 0;
     $68 = HEAP32[$67 >> 2] | 0;
     $69 = $68 + 8 | 0;
     $70 = HEAP32[$69 >> 2] | 0;
     $71 = ($66 | 0) == ($70 | 0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[376 >> 2] = $74;
       $89 = $34;
      } else {
       $75 = HEAP32[392 >> 2] | 0;
       $76 = $70 >>> 0 < $75 >>> 0;
       if ($76) {
        _abort();
       }
       $77 = $70 + 12 | 0;
       $78 = HEAP32[$77 >> 2] | 0;
       $79 = ($78 | 0) == ($68 | 0);
       if ($79) {
        HEAP32[$77 >> 2] = $66;
        HEAP32[$67 >> 2] = $70;
        $$pre = HEAP32[384 >> 2] | 0;
        $89 = $$pre;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     $80 = $64 << 3;
     $81 = $80 - $4 | 0;
     $82 = $4 | 3;
     $83 = $68 + 4 | 0;
     HEAP32[$83 >> 2] = $82;
     $84 = $68 + $4 | 0;
     $85 = $81 | 1;
     $$sum56 = $4 | 4;
     $86 = $68 + $$sum56 | 0;
     HEAP32[$86 >> 2] = $85;
     $87 = $68 + $80 | 0;
     HEAP32[$87 >> 2] = $81;
     $88 = ($89 | 0) == 0;
     if (!$88) {
      $90 = HEAP32[396 >> 2] | 0;
      $91 = $89 >>> 3;
      $92 = $91 << 1;
      $93 = 416 + ($92 << 2) | 0;
      $94 = HEAP32[376 >> 2] | 0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96 | 0) == 0;
      if ($97) {
       $98 = $94 | $95;
       HEAP32[376 >> 2] = $98;
       $$pre105 = $92 + 2 | 0;
       $$pre106 = 416 + ($$pre105 << 2) | 0;
       $$pre$phiZ2D = $$pre106;
       $F4$0 = $93;
      } else {
       $$sum9 = $92 + 2 | 0;
       $99 = 416 + ($$sum9 << 2) | 0;
       $100 = HEAP32[$99 >> 2] | 0;
       $101 = HEAP32[392 >> 2] | 0;
       $102 = $100 >>> 0 < $101 >>> 0;
       if ($102) {
        _abort();
       } else {
        $$pre$phiZ2D = $99;
        $F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D >> 2] = $90;
      $103 = $F4$0 + 12 | 0;
      HEAP32[$103 >> 2] = $90;
      $104 = $90 + 8 | 0;
      HEAP32[$104 >> 2] = $F4$0;
      $105 = $90 + 12 | 0;
      HEAP32[$105 >> 2] = $93;
     }
     HEAP32[384 >> 2] = $81;
     HEAP32[396 >> 2] = $84;
     $mem$0 = $69;
     return $mem$0 | 0;
    }
    $106 = HEAP32[380 >> 2] | 0;
    $107 = ($106 | 0) == 0;
    if ($107) {
     $nb$0 = $4;
    } else {
     $108 = 0 - $106 | 0;
     $109 = $106 & $108;
     $110 = $109 + -1 | 0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = $128 + $129 | 0;
     $131 = 680 + ($130 << 2) | 0;
     $132 = HEAP32[$131 >> 2] | 0;
     $133 = $132 + 4 | 0;
     $134 = HEAP32[$133 >> 2] | 0;
     $135 = $134 & -8;
     $136 = $135 - $4 | 0;
     $rsize$0$i = $136;
     $t$0$i = $132;
     $v$0$i = $132;
     while (1) {
      $137 = $t$0$i + 16 | 0;
      $138 = HEAP32[$137 >> 2] | 0;
      $139 = ($138 | 0) == (0 | 0);
      if ($139) {
       $140 = $t$0$i + 20 | 0;
       $141 = HEAP32[$140 >> 2] | 0;
       $142 = ($141 | 0) == (0 | 0);
       if ($142) {
        $rsize$0$i$lcssa = $rsize$0$i;
        $v$0$i$lcssa = $v$0$i;
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = $144 + 4 | 0;
      $145 = HEAP32[$143 >> 2] | 0;
      $146 = $145 & -8;
      $147 = $146 - $4 | 0;
      $148 = $147 >>> 0 < $rsize$0$i >>> 0;
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;
      $t$0$i = $144;
      $v$0$i = $$v$0$i;
     }
     $149 = HEAP32[392 >> 2] | 0;
     $150 = $v$0$i$lcssa >>> 0 < $149 >>> 0;
     if ($150) {
      _abort();
     }
     $151 = $v$0$i$lcssa + $4 | 0;
     $152 = $v$0$i$lcssa >>> 0 < $151 >>> 0;
     if (!$152) {
      _abort();
     }
     $153 = $v$0$i$lcssa + 24 | 0;
     $154 = HEAP32[$153 >> 2] | 0;
     $155 = $v$0$i$lcssa + 12 | 0;
     $156 = HEAP32[$155 >> 2] | 0;
     $157 = ($156 | 0) == ($v$0$i$lcssa | 0);
     do {
      if ($157) {
       $167 = $v$0$i$lcssa + 20 | 0;
       $168 = HEAP32[$167 >> 2] | 0;
       $169 = ($168 | 0) == (0 | 0);
       if ($169) {
        $170 = $v$0$i$lcssa + 16 | 0;
        $171 = HEAP32[$170 >> 2] | 0;
        $172 = ($171 | 0) == (0 | 0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;
         $RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;
        $RP$0$i = $167;
       }
       while (1) {
        $173 = $R$0$i + 20 | 0;
        $174 = HEAP32[$173 >> 2] | 0;
        $175 = ($174 | 0) == (0 | 0);
        if (!$175) {
         $R$0$i = $174;
         $RP$0$i = $173;
         continue;
        }
        $176 = $R$0$i + 16 | 0;
        $177 = HEAP32[$176 >> 2] | 0;
        $178 = ($177 | 0) == (0 | 0);
        if ($178) {
         $R$0$i$lcssa = $R$0$i;
         $RP$0$i$lcssa = $RP$0$i;
         break;
        } else {
         $R$0$i = $177;
         $RP$0$i = $176;
        }
       }
       $179 = $RP$0$i$lcssa >>> 0 < $149 >>> 0;
       if ($179) {
        _abort();
       } else {
        HEAP32[$RP$0$i$lcssa >> 2] = 0;
        $R$1$i = $R$0$i$lcssa;
        break;
       }
      } else {
       $158 = $v$0$i$lcssa + 8 | 0;
       $159 = HEAP32[$158 >> 2] | 0;
       $160 = $159 >>> 0 < $149 >>> 0;
       if ($160) {
        _abort();
       }
       $161 = $159 + 12 | 0;
       $162 = HEAP32[$161 >> 2] | 0;
       $163 = ($162 | 0) == ($v$0$i$lcssa | 0);
       if (!$163) {
        _abort();
       }
       $164 = $156 + 8 | 0;
       $165 = HEAP32[$164 >> 2] | 0;
       $166 = ($165 | 0) == ($v$0$i$lcssa | 0);
       if ($166) {
        HEAP32[$161 >> 2] = $156;
        HEAP32[$164 >> 2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     $180 = ($154 | 0) == (0 | 0);
     do {
      if (!$180) {
       $181 = $v$0$i$lcssa + 28 | 0;
       $182 = HEAP32[$181 >> 2] | 0;
       $183 = 680 + ($182 << 2) | 0;
       $184 = HEAP32[$183 >> 2] | 0;
       $185 = ($v$0$i$lcssa | 0) == ($184 | 0);
       if ($185) {
        HEAP32[$183 >> 2] = $R$1$i;
        $cond$i = ($R$1$i | 0) == (0 | 0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[380 >> 2] | 0;
         $189 = $188 & $187;
         HEAP32[380 >> 2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[392 >> 2] | 0;
        $191 = $154 >>> 0 < $190 >>> 0;
        if ($191) {
         _abort();
        }
        $192 = $154 + 16 | 0;
        $193 = HEAP32[$192 >> 2] | 0;
        $194 = ($193 | 0) == ($v$0$i$lcssa | 0);
        if ($194) {
         HEAP32[$192 >> 2] = $R$1$i;
        } else {
         $195 = $154 + 20 | 0;
         HEAP32[$195 >> 2] = $R$1$i;
        }
        $196 = ($R$1$i | 0) == (0 | 0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[392 >> 2] | 0;
       $198 = $R$1$i >>> 0 < $197 >>> 0;
       if ($198) {
        _abort();
       }
       $199 = $R$1$i + 24 | 0;
       HEAP32[$199 >> 2] = $154;
       $200 = $v$0$i$lcssa + 16 | 0;
       $201 = HEAP32[$200 >> 2] | 0;
       $202 = ($201 | 0) == (0 | 0);
       do {
        if (!$202) {
         $203 = $201 >>> 0 < $197 >>> 0;
         if ($203) {
          _abort();
         } else {
          $204 = $R$1$i + 16 | 0;
          HEAP32[$204 >> 2] = $201;
          $205 = $201 + 24 | 0;
          HEAP32[$205 >> 2] = $R$1$i;
          break;
         }
        }
       } while (0);
       $206 = $v$0$i$lcssa + 20 | 0;
       $207 = HEAP32[$206 >> 2] | 0;
       $208 = ($207 | 0) == (0 | 0);
       if (!$208) {
        $209 = HEAP32[392 >> 2] | 0;
        $210 = $207 >>> 0 < $209 >>> 0;
        if ($210) {
         _abort();
        } else {
         $211 = $R$1$i + 20 | 0;
         HEAP32[$211 >> 2] = $207;
         $212 = $207 + 24 | 0;
         HEAP32[$212 >> 2] = $R$1$i;
         break;
        }
       }
      }
     } while (0);
     $213 = $rsize$0$i$lcssa >>> 0 < 16;
     if ($213) {
      $214 = $rsize$0$i$lcssa + $4 | 0;
      $215 = $214 | 3;
      $216 = $v$0$i$lcssa + 4 | 0;
      HEAP32[$216 >> 2] = $215;
      $$sum4$i = $214 + 4 | 0;
      $217 = $v$0$i$lcssa + $$sum4$i | 0;
      $218 = HEAP32[$217 >> 2] | 0;
      $219 = $218 | 1;
      HEAP32[$217 >> 2] = $219;
     } else {
      $220 = $4 | 3;
      $221 = $v$0$i$lcssa + 4 | 0;
      HEAP32[$221 >> 2] = $220;
      $222 = $rsize$0$i$lcssa | 1;
      $$sum$i35 = $4 | 4;
      $223 = $v$0$i$lcssa + $$sum$i35 | 0;
      HEAP32[$223 >> 2] = $222;
      $$sum1$i = $rsize$0$i$lcssa + $4 | 0;
      $224 = $v$0$i$lcssa + $$sum1$i | 0;
      HEAP32[$224 >> 2] = $rsize$0$i$lcssa;
      $225 = HEAP32[384 >> 2] | 0;
      $226 = ($225 | 0) == 0;
      if (!$226) {
       $227 = HEAP32[396 >> 2] | 0;
       $228 = $225 >>> 3;
       $229 = $228 << 1;
       $230 = 416 + ($229 << 2) | 0;
       $231 = HEAP32[376 >> 2] | 0;
       $232 = 1 << $228;
       $233 = $231 & $232;
       $234 = ($233 | 0) == 0;
       if ($234) {
        $235 = $231 | $232;
        HEAP32[376 >> 2] = $235;
        $$pre$i = $229 + 2 | 0;
        $$pre8$i = 416 + ($$pre$i << 2) | 0;
        $$pre$phi$iZ2D = $$pre8$i;
        $F1$0$i = $230;
       } else {
        $$sum3$i = $229 + 2 | 0;
        $236 = 416 + ($$sum3$i << 2) | 0;
        $237 = HEAP32[$236 >> 2] | 0;
        $238 = HEAP32[392 >> 2] | 0;
        $239 = $237 >>> 0 < $238 >>> 0;
        if ($239) {
         _abort();
        } else {
         $$pre$phi$iZ2D = $236;
         $F1$0$i = $237;
        }
       }
       HEAP32[$$pre$phi$iZ2D >> 2] = $227;
       $240 = $F1$0$i + 12 | 0;
       HEAP32[$240 >> 2] = $227;
       $241 = $227 + 8 | 0;
       HEAP32[$241 >> 2] = $F1$0$i;
       $242 = $227 + 12 | 0;
       HEAP32[$242 >> 2] = $230;
      }
      HEAP32[384 >> 2] = $rsize$0$i$lcssa;
      HEAP32[396 >> 2] = $151;
     }
     $243 = $v$0$i$lcssa + 8 | 0;
     $mem$0 = $243;
     return $mem$0 | 0;
    }
   } else {
    $nb$0 = $4;
   }
  } else {
   $244 = $bytes >>> 0 > 4294967231;
   if ($244) {
    $nb$0 = -1;
   } else {
    $245 = $bytes + 11 | 0;
    $246 = $245 & -8;
    $247 = HEAP32[380 >> 2] | 0;
    $248 = ($247 | 0) == 0;
    if ($248) {
     $nb$0 = $246;
    } else {
     $249 = 0 - $246 | 0;
     $250 = $245 >>> 8;
     $251 = ($250 | 0) == 0;
     if ($251) {
      $idx$0$i = 0;
     } else {
      $252 = $246 >>> 0 > 16777215;
      if ($252) {
       $idx$0$i = 31;
      } else {
       $253 = $250 + 1048320 | 0;
       $254 = $253 >>> 16;
       $255 = $254 & 8;
       $256 = $250 << $255;
       $257 = $256 + 520192 | 0;
       $258 = $257 >>> 16;
       $259 = $258 & 4;
       $260 = $259 | $255;
       $261 = $256 << $259;
       $262 = $261 + 245760 | 0;
       $263 = $262 >>> 16;
       $264 = $263 & 2;
       $265 = $260 | $264;
       $266 = 14 - $265 | 0;
       $267 = $261 << $264;
       $268 = $267 >>> 15;
       $269 = $266 + $268 | 0;
       $270 = $269 << 1;
       $271 = $269 + 7 | 0;
       $272 = $246 >>> $271;
       $273 = $272 & 1;
       $274 = $273 | $270;
       $idx$0$i = $274;
      }
     }
     $275 = 680 + ($idx$0$i << 2) | 0;
     $276 = HEAP32[$275 >> 2] | 0;
     $277 = ($276 | 0) == (0 | 0);
     L123 : do {
      if ($277) {
       $rsize$2$i = $249;
       $t$1$i = 0;
       $v$2$i = 0;
       label = 86;
      } else {
       $278 = ($idx$0$i | 0) == 31;
       $279 = $idx$0$i >>> 1;
       $280 = 25 - $279 | 0;
       $281 = $278 ? 0 : $280;
       $282 = $246 << $281;
       $rsize$0$i15 = $249;
       $rst$0$i = 0;
       $sizebits$0$i = $282;
       $t$0$i14 = $276;
       $v$0$i16 = 0;
       while (1) {
        $283 = $t$0$i14 + 4 | 0;
        $284 = HEAP32[$283 >> 2] | 0;
        $285 = $284 & -8;
        $286 = $285 - $246 | 0;
        $287 = $286 >>> 0 < $rsize$0$i15 >>> 0;
        if ($287) {
         $288 = ($285 | 0) == ($246 | 0);
         if ($288) {
          $rsize$331$i = $286;
          $t$230$i = $t$0$i14;
          $v$332$i = $t$0$i14;
          label = 90;
          break L123;
         } else {
          $rsize$1$i = $286;
          $v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;
         $v$1$i = $v$0$i16;
        }
        $289 = $t$0$i14 + 20 | 0;
        $290 = HEAP32[$289 >> 2] | 0;
        $291 = $sizebits$0$i >>> 31;
        $292 = ($t$0$i14 + 16 | 0) + ($291 << 2) | 0;
        $293 = HEAP32[$292 >> 2] | 0;
        $294 = ($290 | 0) == (0 | 0);
        $295 = ($290 | 0) == ($293 | 0);
        $or$cond19$i = $294 | $295;
        $rst$1$i = $or$cond19$i ? $rst$0$i : $290;
        $296 = ($293 | 0) == (0 | 0);
        $297 = $sizebits$0$i << 1;
        if ($296) {
         $rsize$2$i = $rsize$1$i;
         $t$1$i = $rst$1$i;
         $v$2$i = $v$1$i;
         label = 86;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;
         $rst$0$i = $rst$1$i;
         $sizebits$0$i = $297;
         $t$0$i14 = $293;
         $v$0$i16 = $v$1$i;
        }
       }
      }
     } while (0);
     if ((label | 0) == 86) {
      $298 = ($t$1$i | 0) == (0 | 0);
      $299 = ($v$2$i | 0) == (0 | 0);
      $or$cond$i = $298 & $299;
      if ($or$cond$i) {
       $300 = 2 << $idx$0$i;
       $301 = 0 - $300 | 0;
       $302 = $300 | $301;
       $303 = $247 & $302;
       $304 = ($303 | 0) == 0;
       if ($304) {
        $nb$0 = $246;
        break;
       }
       $305 = 0 - $303 | 0;
       $306 = $303 & $305;
       $307 = $306 + -1 | 0;
       $308 = $307 >>> 12;
       $309 = $308 & 16;
       $310 = $307 >>> $309;
       $311 = $310 >>> 5;
       $312 = $311 & 8;
       $313 = $312 | $309;
       $314 = $310 >>> $312;
       $315 = $314 >>> 2;
       $316 = $315 & 4;
       $317 = $313 | $316;
       $318 = $314 >>> $316;
       $319 = $318 >>> 1;
       $320 = $319 & 2;
       $321 = $317 | $320;
       $322 = $318 >>> $320;
       $323 = $322 >>> 1;
       $324 = $323 & 1;
       $325 = $321 | $324;
       $326 = $322 >>> $324;
       $327 = $325 + $326 | 0;
       $328 = 680 + ($327 << 2) | 0;
       $329 = HEAP32[$328 >> 2] | 0;
       $t$2$ph$i = $329;
       $v$3$ph$i = 0;
      } else {
       $t$2$ph$i = $t$1$i;
       $v$3$ph$i = $v$2$i;
      }
      $330 = ($t$2$ph$i | 0) == (0 | 0);
      if ($330) {
       $rsize$3$lcssa$i = $rsize$2$i;
       $v$3$lcssa$i = $v$3$ph$i;
      } else {
       $rsize$331$i = $rsize$2$i;
       $t$230$i = $t$2$ph$i;
       $v$332$i = $v$3$ph$i;
       label = 90;
      }
     }
     if ((label | 0) == 90) {
      while (1) {
       label = 0;
       $331 = $t$230$i + 4 | 0;
       $332 = HEAP32[$331 >> 2] | 0;
       $333 = $332 & -8;
       $334 = $333 - $246 | 0;
       $335 = $334 >>> 0 < $rsize$331$i >>> 0;
       $$rsize$3$i = $335 ? $334 : $rsize$331$i;
       $t$2$v$3$i = $335 ? $t$230$i : $v$332$i;
       $336 = $t$230$i + 16 | 0;
       $337 = HEAP32[$336 >> 2] | 0;
       $338 = ($337 | 0) == (0 | 0);
       if (!$338) {
        $rsize$331$i = $$rsize$3$i;
        $t$230$i = $337;
        $v$332$i = $t$2$v$3$i;
        label = 90;
        continue;
       }
       $339 = $t$230$i + 20 | 0;
       $340 = HEAP32[$339 >> 2] | 0;
       $341 = ($340 | 0) == (0 | 0);
       if ($341) {
        $rsize$3$lcssa$i = $$rsize$3$i;
        $v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$331$i = $$rsize$3$i;
        $t$230$i = $340;
        $v$332$i = $t$2$v$3$i;
        label = 90;
       }
      }
     }
     $342 = ($v$3$lcssa$i | 0) == (0 | 0);
     if ($342) {
      $nb$0 = $246;
     } else {
      $343 = HEAP32[384 >> 2] | 0;
      $344 = $343 - $246 | 0;
      $345 = $rsize$3$lcssa$i >>> 0 < $344 >>> 0;
      if ($345) {
       $346 = HEAP32[392 >> 2] | 0;
       $347 = $v$3$lcssa$i >>> 0 < $346 >>> 0;
       if ($347) {
        _abort();
       }
       $348 = $v$3$lcssa$i + $246 | 0;
       $349 = $v$3$lcssa$i >>> 0 < $348 >>> 0;
       if (!$349) {
        _abort();
       }
       $350 = $v$3$lcssa$i + 24 | 0;
       $351 = HEAP32[$350 >> 2] | 0;
       $352 = $v$3$lcssa$i + 12 | 0;
       $353 = HEAP32[$352 >> 2] | 0;
       $354 = ($353 | 0) == ($v$3$lcssa$i | 0);
       do {
        if ($354) {
         $364 = $v$3$lcssa$i + 20 | 0;
         $365 = HEAP32[$364 >> 2] | 0;
         $366 = ($365 | 0) == (0 | 0);
         if ($366) {
          $367 = $v$3$lcssa$i + 16 | 0;
          $368 = HEAP32[$367 >> 2] | 0;
          $369 = ($368 | 0) == (0 | 0);
          if ($369) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $368;
           $RP$0$i17 = $367;
          }
         } else {
          $R$0$i18 = $365;
          $RP$0$i17 = $364;
         }
         while (1) {
          $370 = $R$0$i18 + 20 | 0;
          $371 = HEAP32[$370 >> 2] | 0;
          $372 = ($371 | 0) == (0 | 0);
          if (!$372) {
           $R$0$i18 = $371;
           $RP$0$i17 = $370;
           continue;
          }
          $373 = $R$0$i18 + 16 | 0;
          $374 = HEAP32[$373 >> 2] | 0;
          $375 = ($374 | 0) == (0 | 0);
          if ($375) {
           $R$0$i18$lcssa = $R$0$i18;
           $RP$0$i17$lcssa = $RP$0$i17;
           break;
          } else {
           $R$0$i18 = $374;
           $RP$0$i17 = $373;
          }
         }
         $376 = $RP$0$i17$lcssa >>> 0 < $346 >>> 0;
         if ($376) {
          _abort();
         } else {
          HEAP32[$RP$0$i17$lcssa >> 2] = 0;
          $R$1$i20 = $R$0$i18$lcssa;
          break;
         }
        } else {
         $355 = $v$3$lcssa$i + 8 | 0;
         $356 = HEAP32[$355 >> 2] | 0;
         $357 = $356 >>> 0 < $346 >>> 0;
         if ($357) {
          _abort();
         }
         $358 = $356 + 12 | 0;
         $359 = HEAP32[$358 >> 2] | 0;
         $360 = ($359 | 0) == ($v$3$lcssa$i | 0);
         if (!$360) {
          _abort();
         }
         $361 = $353 + 8 | 0;
         $362 = HEAP32[$361 >> 2] | 0;
         $363 = ($362 | 0) == ($v$3$lcssa$i | 0);
         if ($363) {
          HEAP32[$358 >> 2] = $353;
          HEAP32[$361 >> 2] = $356;
          $R$1$i20 = $353;
          break;
         } else {
          _abort();
         }
        }
       } while (0);
       $377 = ($351 | 0) == (0 | 0);
       do {
        if (!$377) {
         $378 = $v$3$lcssa$i + 28 | 0;
         $379 = HEAP32[$378 >> 2] | 0;
         $380 = 680 + ($379 << 2) | 0;
         $381 = HEAP32[$380 >> 2] | 0;
         $382 = ($v$3$lcssa$i | 0) == ($381 | 0);
         if ($382) {
          HEAP32[$380 >> 2] = $R$1$i20;
          $cond$i21 = ($R$1$i20 | 0) == (0 | 0);
          if ($cond$i21) {
           $383 = 1 << $379;
           $384 = $383 ^ -1;
           $385 = HEAP32[380 >> 2] | 0;
           $386 = $385 & $384;
           HEAP32[380 >> 2] = $386;
           break;
          }
         } else {
          $387 = HEAP32[392 >> 2] | 0;
          $388 = $351 >>> 0 < $387 >>> 0;
          if ($388) {
           _abort();
          }
          $389 = $351 + 16 | 0;
          $390 = HEAP32[$389 >> 2] | 0;
          $391 = ($390 | 0) == ($v$3$lcssa$i | 0);
          if ($391) {
           HEAP32[$389 >> 2] = $R$1$i20;
          } else {
           $392 = $351 + 20 | 0;
           HEAP32[$392 >> 2] = $R$1$i20;
          }
          $393 = ($R$1$i20 | 0) == (0 | 0);
          if ($393) {
           break;
          }
         }
         $394 = HEAP32[392 >> 2] | 0;
         $395 = $R$1$i20 >>> 0 < $394 >>> 0;
         if ($395) {
          _abort();
         }
         $396 = $R$1$i20 + 24 | 0;
         HEAP32[$396 >> 2] = $351;
         $397 = $v$3$lcssa$i + 16 | 0;
         $398 = HEAP32[$397 >> 2] | 0;
         $399 = ($398 | 0) == (0 | 0);
         do {
          if (!$399) {
           $400 = $398 >>> 0 < $394 >>> 0;
           if ($400) {
            _abort();
           } else {
            $401 = $R$1$i20 + 16 | 0;
            HEAP32[$401 >> 2] = $398;
            $402 = $398 + 24 | 0;
            HEAP32[$402 >> 2] = $R$1$i20;
            break;
           }
          }
         } while (0);
         $403 = $v$3$lcssa$i + 20 | 0;
         $404 = HEAP32[$403 >> 2] | 0;
         $405 = ($404 | 0) == (0 | 0);
         if (!$405) {
          $406 = HEAP32[392 >> 2] | 0;
          $407 = $404 >>> 0 < $406 >>> 0;
          if ($407) {
           _abort();
          } else {
           $408 = $R$1$i20 + 20 | 0;
           HEAP32[$408 >> 2] = $404;
           $409 = $404 + 24 | 0;
           HEAP32[$409 >> 2] = $R$1$i20;
           break;
          }
         }
        }
       } while (0);
       $410 = $rsize$3$lcssa$i >>> 0 < 16;
       L199 : do {
        if ($410) {
         $411 = $rsize$3$lcssa$i + $246 | 0;
         $412 = $411 | 3;
         $413 = $v$3$lcssa$i + 4 | 0;
         HEAP32[$413 >> 2] = $412;
         $$sum18$i = $411 + 4 | 0;
         $414 = $v$3$lcssa$i + $$sum18$i | 0;
         $415 = HEAP32[$414 >> 2] | 0;
         $416 = $415 | 1;
         HEAP32[$414 >> 2] = $416;
        } else {
         $417 = $246 | 3;
         $418 = $v$3$lcssa$i + 4 | 0;
         HEAP32[$418 >> 2] = $417;
         $419 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $246 | 4;
         $420 = $v$3$lcssa$i + $$sum$i2334 | 0;
         HEAP32[$420 >> 2] = $419;
         $$sum1$i24 = $rsize$3$lcssa$i + $246 | 0;
         $421 = $v$3$lcssa$i + $$sum1$i24 | 0;
         HEAP32[$421 >> 2] = $rsize$3$lcssa$i;
         $422 = $rsize$3$lcssa$i >>> 3;
         $423 = $rsize$3$lcssa$i >>> 0 < 256;
         if ($423) {
          $424 = $422 << 1;
          $425 = 416 + ($424 << 2) | 0;
          $426 = HEAP32[376 >> 2] | 0;
          $427 = 1 << $422;
          $428 = $426 & $427;
          $429 = ($428 | 0) == 0;
          if ($429) {
           $430 = $426 | $427;
           HEAP32[376 >> 2] = $430;
           $$pre$i25 = $424 + 2 | 0;
           $$pre43$i = 416 + ($$pre$i25 << 2) | 0;
           $$pre$phi$i26Z2D = $$pre43$i;
           $F5$0$i = $425;
          } else {
           $$sum17$i = $424 + 2 | 0;
           $431 = 416 + ($$sum17$i << 2) | 0;
           $432 = HEAP32[$431 >> 2] | 0;
           $433 = HEAP32[392 >> 2] | 0;
           $434 = $432 >>> 0 < $433 >>> 0;
           if ($434) {
            _abort();
           } else {
            $$pre$phi$i26Z2D = $431;
            $F5$0$i = $432;
           }
          }
          HEAP32[$$pre$phi$i26Z2D >> 2] = $348;
          $435 = $F5$0$i + 12 | 0;
          HEAP32[$435 >> 2] = $348;
          $$sum15$i = $246 + 8 | 0;
          $436 = $v$3$lcssa$i + $$sum15$i | 0;
          HEAP32[$436 >> 2] = $F5$0$i;
          $$sum16$i = $246 + 12 | 0;
          $437 = $v$3$lcssa$i + $$sum16$i | 0;
          HEAP32[$437 >> 2] = $425;
          break;
         }
         $438 = $rsize$3$lcssa$i >>> 8;
         $439 = ($438 | 0) == 0;
         if ($439) {
          $I7$0$i = 0;
         } else {
          $440 = $rsize$3$lcssa$i >>> 0 > 16777215;
          if ($440) {
           $I7$0$i = 31;
          } else {
           $441 = $438 + 1048320 | 0;
           $442 = $441 >>> 16;
           $443 = $442 & 8;
           $444 = $438 << $443;
           $445 = $444 + 520192 | 0;
           $446 = $445 >>> 16;
           $447 = $446 & 4;
           $448 = $447 | $443;
           $449 = $444 << $447;
           $450 = $449 + 245760 | 0;
           $451 = $450 >>> 16;
           $452 = $451 & 2;
           $453 = $448 | $452;
           $454 = 14 - $453 | 0;
           $455 = $449 << $452;
           $456 = $455 >>> 15;
           $457 = $454 + $456 | 0;
           $458 = $457 << 1;
           $459 = $457 + 7 | 0;
           $460 = $rsize$3$lcssa$i >>> $459;
           $461 = $460 & 1;
           $462 = $461 | $458;
           $I7$0$i = $462;
          }
         }
         $463 = 680 + ($I7$0$i << 2) | 0;
         $$sum2$i = $246 + 28 | 0;
         $464 = $v$3$lcssa$i + $$sum2$i | 0;
         HEAP32[$464 >> 2] = $I7$0$i;
         $$sum3$i27 = $246 + 16 | 0;
         $465 = $v$3$lcssa$i + $$sum3$i27 | 0;
         $$sum4$i28 = $246 + 20 | 0;
         $466 = $v$3$lcssa$i + $$sum4$i28 | 0;
         HEAP32[$466 >> 2] = 0;
         HEAP32[$465 >> 2] = 0;
         $467 = HEAP32[380 >> 2] | 0;
         $468 = 1 << $I7$0$i;
         $469 = $467 & $468;
         $470 = ($469 | 0) == 0;
         if ($470) {
          $471 = $467 | $468;
          HEAP32[380 >> 2] = $471;
          HEAP32[$463 >> 2] = $348;
          $$sum5$i = $246 + 24 | 0;
          $472 = $v$3$lcssa$i + $$sum5$i | 0;
          HEAP32[$472 >> 2] = $463;
          $$sum6$i = $246 + 12 | 0;
          $473 = $v$3$lcssa$i + $$sum6$i | 0;
          HEAP32[$473 >> 2] = $348;
          $$sum7$i = $246 + 8 | 0;
          $474 = $v$3$lcssa$i + $$sum7$i | 0;
          HEAP32[$474 >> 2] = $348;
          break;
         }
         $475 = HEAP32[$463 >> 2] | 0;
         $476 = $475 + 4 | 0;
         $477 = HEAP32[$476 >> 2] | 0;
         $478 = $477 & -8;
         $479 = ($478 | 0) == ($rsize$3$lcssa$i | 0);
         L217 : do {
          if ($479) {
           $T$0$lcssa$i = $475;
          } else {
           $480 = ($I7$0$i | 0) == 31;
           $481 = $I7$0$i >>> 1;
           $482 = 25 - $481 | 0;
           $483 = $480 ? 0 : $482;
           $484 = $rsize$3$lcssa$i << $483;
           $K12$029$i = $484;
           $T$028$i = $475;
           while (1) {
            $491 = $K12$029$i >>> 31;
            $492 = ($T$028$i + 16 | 0) + ($491 << 2) | 0;
            $487 = HEAP32[$492 >> 2] | 0;
            $493 = ($487 | 0) == (0 | 0);
            if ($493) {
             $$lcssa232 = $492;
             $T$028$i$lcssa = $T$028$i;
             break;
            }
            $485 = $K12$029$i << 1;
            $486 = $487 + 4 | 0;
            $488 = HEAP32[$486 >> 2] | 0;
            $489 = $488 & -8;
            $490 = ($489 | 0) == ($rsize$3$lcssa$i | 0);
            if ($490) {
             $T$0$lcssa$i = $487;
             break L217;
            } else {
             $K12$029$i = $485;
             $T$028$i = $487;
            }
           }
           $494 = HEAP32[392 >> 2] | 0;
           $495 = $$lcssa232 >>> 0 < $494 >>> 0;
           if ($495) {
            _abort();
           } else {
            HEAP32[$$lcssa232 >> 2] = $348;
            $$sum11$i = $246 + 24 | 0;
            $496 = $v$3$lcssa$i + $$sum11$i | 0;
            HEAP32[$496 >> 2] = $T$028$i$lcssa;
            $$sum12$i = $246 + 12 | 0;
            $497 = $v$3$lcssa$i + $$sum12$i | 0;
            HEAP32[$497 >> 2] = $348;
            $$sum13$i = $246 + 8 | 0;
            $498 = $v$3$lcssa$i + $$sum13$i | 0;
            HEAP32[$498 >> 2] = $348;
            break L199;
           }
          }
         } while (0);
         $499 = $T$0$lcssa$i + 8 | 0;
         $500 = HEAP32[$499 >> 2] | 0;
         $501 = HEAP32[392 >> 2] | 0;
         $502 = $500 >>> 0 >= $501 >>> 0;
         $not$$i = $T$0$lcssa$i >>> 0 >= $501 >>> 0;
         $503 = $502 & $not$$i;
         if ($503) {
          $504 = $500 + 12 | 0;
          HEAP32[$504 >> 2] = $348;
          HEAP32[$499 >> 2] = $348;
          $$sum8$i = $246 + 8 | 0;
          $505 = $v$3$lcssa$i + $$sum8$i | 0;
          HEAP32[$505 >> 2] = $500;
          $$sum9$i = $246 + 12 | 0;
          $506 = $v$3$lcssa$i + $$sum9$i | 0;
          HEAP32[$506 >> 2] = $T$0$lcssa$i;
          $$sum10$i = $246 + 24 | 0;
          $507 = $v$3$lcssa$i + $$sum10$i | 0;
          HEAP32[$507 >> 2] = 0;
          break;
         } else {
          _abort();
         }
        }
       } while (0);
       $508 = $v$3$lcssa$i + 8 | 0;
       $mem$0 = $508;
       return $mem$0 | 0;
      } else {
       $nb$0 = $246;
      }
     }
    }
   }
  }
 } while (0);
 $509 = HEAP32[384 >> 2] | 0;
 $510 = $509 >>> 0 < $nb$0 >>> 0;
 if (!$510) {
  $511 = $509 - $nb$0 | 0;
  $512 = HEAP32[396 >> 2] | 0;
  $513 = $511 >>> 0 > 15;
  if ($513) {
   $514 = $512 + $nb$0 | 0;
   HEAP32[396 >> 2] = $514;
   HEAP32[384 >> 2] = $511;
   $515 = $511 | 1;
   $$sum2 = $nb$0 + 4 | 0;
   $516 = $512 + $$sum2 | 0;
   HEAP32[$516 >> 2] = $515;
   $517 = $512 + $509 | 0;
   HEAP32[$517 >> 2] = $511;
   $518 = $nb$0 | 3;
   $519 = $512 + 4 | 0;
   HEAP32[$519 >> 2] = $518;
  } else {
   HEAP32[384 >> 2] = 0;
   HEAP32[396 >> 2] = 0;
   $520 = $509 | 3;
   $521 = $512 + 4 | 0;
   HEAP32[$521 >> 2] = $520;
   $$sum1 = $509 + 4 | 0;
   $522 = $512 + $$sum1 | 0;
   $523 = HEAP32[$522 >> 2] | 0;
   $524 = $523 | 1;
   HEAP32[$522 >> 2] = $524;
  }
  $525 = $512 + 8 | 0;
  $mem$0 = $525;
  return $mem$0 | 0;
 }
 $526 = HEAP32[388 >> 2] | 0;
 $527 = $526 >>> 0 > $nb$0 >>> 0;
 if ($527) {
  $528 = $526 - $nb$0 | 0;
  HEAP32[388 >> 2] = $528;
  $529 = HEAP32[400 >> 2] | 0;
  $530 = $529 + $nb$0 | 0;
  HEAP32[400 >> 2] = $530;
  $531 = $528 | 1;
  $$sum = $nb$0 + 4 | 0;
  $532 = $529 + $$sum | 0;
  HEAP32[$532 >> 2] = $531;
  $533 = $nb$0 | 3;
  $534 = $529 + 4 | 0;
  HEAP32[$534 >> 2] = $533;
  $535 = $529 + 8 | 0;
  $mem$0 = $535;
  return $mem$0 | 0;
 }
 $536 = HEAP32[848 >> 2] | 0;
 $537 = ($536 | 0) == 0;
 do {
  if ($537) {
   $538 = _sysconf(30) | 0;
   $539 = $538 + -1 | 0;
   $540 = $539 & $538;
   $541 = ($540 | 0) == 0;
   if ($541) {
    HEAP32[856 >> 2] = $538;
    HEAP32[852 >> 2] = $538;
    HEAP32[860 >> 2] = -1;
    HEAP32[864 >> 2] = -1;
    HEAP32[868 >> 2] = 0;
    HEAP32[820 >> 2] = 0;
    $542 = _time(0 | 0) | 0;
    $543 = $542 & -16;
    $544 = $543 ^ 1431655768;
    HEAP32[848 >> 2] = $544;
    break;
   } else {
    _abort();
   }
  }
 } while (0);
 $545 = $nb$0 + 48 | 0;
 $546 = HEAP32[856 >> 2] | 0;
 $547 = $nb$0 + 47 | 0;
 $548 = $546 + $547 | 0;
 $549 = 0 - $546 | 0;
 $550 = $548 & $549;
 $551 = $550 >>> 0 > $nb$0 >>> 0;
 if (!$551) {
  $mem$0 = 0;
  return $mem$0 | 0;
 }
 $552 = HEAP32[816 >> 2] | 0;
 $553 = ($552 | 0) == 0;
 if (!$553) {
  $554 = HEAP32[808 >> 2] | 0;
  $555 = $554 + $550 | 0;
  $556 = $555 >>> 0 <= $554 >>> 0;
  $557 = $555 >>> 0 > $552 >>> 0;
  $or$cond1$i = $556 | $557;
  if ($or$cond1$i) {
   $mem$0 = 0;
   return $mem$0 | 0;
  }
 }
 $558 = HEAP32[820 >> 2] | 0;
 $559 = $558 & 4;
 $560 = ($559 | 0) == 0;
 L258 : do {
  if ($560) {
   $561 = HEAP32[400 >> 2] | 0;
   $562 = ($561 | 0) == (0 | 0);
   L260 : do {
    if ($562) {
     label = 174;
    } else {
     $sp$0$i$i = 824;
     while (1) {
      $563 = HEAP32[$sp$0$i$i >> 2] | 0;
      $564 = $563 >>> 0 > $561 >>> 0;
      if (!$564) {
       $565 = $sp$0$i$i + 4 | 0;
       $566 = HEAP32[$565 >> 2] | 0;
       $567 = $563 + $566 | 0;
       $568 = $567 >>> 0 > $561 >>> 0;
       if ($568) {
        $$lcssa228 = $sp$0$i$i;
        $$lcssa230 = $565;
        break;
       }
      }
      $569 = $sp$0$i$i + 8 | 0;
      $570 = HEAP32[$569 >> 2] | 0;
      $571 = ($570 | 0) == (0 | 0);
      if ($571) {
       label = 174;
       break L260;
      } else {
       $sp$0$i$i = $570;
      }
     }
     $594 = HEAP32[388 >> 2] | 0;
     $595 = $548 - $594 | 0;
     $596 = $595 & $549;
     $597 = $596 >>> 0 < 2147483647;
     if ($597) {
      $598 = _sbrk($596 | 0) | 0;
      $599 = HEAP32[$$lcssa228 >> 2] | 0;
      $600 = HEAP32[$$lcssa230 >> 2] | 0;
      $601 = $599 + $600 | 0;
      $602 = ($598 | 0) == ($601 | 0);
      $$3$i = $602 ? $596 : 0;
      if ($602) {
       $603 = ($598 | 0) == (-1 | 0);
       if ($603) {
        $tsize$0323944$i = $$3$i;
       } else {
        $tbase$255$i = $598;
        $tsize$254$i = $$3$i;
        label = 194;
        break L258;
       }
      } else {
       $br$0$ph$i = $598;
       $ssize$1$ph$i = $596;
       $tsize$0$ph$i = $$3$i;
       label = 184;
      }
     } else {
      $tsize$0323944$i = 0;
     }
    }
   } while (0);
   do {
    if ((label | 0) == 174) {
     $572 = _sbrk(0) | 0;
     $573 = ($572 | 0) == (-1 | 0);
     if ($573) {
      $tsize$0323944$i = 0;
     } else {
      $574 = $572;
      $575 = HEAP32[852 >> 2] | 0;
      $576 = $575 + -1 | 0;
      $577 = $576 & $574;
      $578 = ($577 | 0) == 0;
      if ($578) {
       $ssize$0$i = $550;
      } else {
       $579 = $576 + $574 | 0;
       $580 = 0 - $575 | 0;
       $581 = $579 & $580;
       $582 = $550 - $574 | 0;
       $583 = $582 + $581 | 0;
       $ssize$0$i = $583;
      }
      $584 = HEAP32[808 >> 2] | 0;
      $585 = $584 + $ssize$0$i | 0;
      $586 = $ssize$0$i >>> 0 > $nb$0 >>> 0;
      $587 = $ssize$0$i >>> 0 < 2147483647;
      $or$cond$i30 = $586 & $587;
      if ($or$cond$i30) {
       $588 = HEAP32[816 >> 2] | 0;
       $589 = ($588 | 0) == 0;
       if (!$589) {
        $590 = $585 >>> 0 <= $584 >>> 0;
        $591 = $585 >>> 0 > $588 >>> 0;
        $or$cond2$i = $590 | $591;
        if ($or$cond2$i) {
         $tsize$0323944$i = 0;
         break;
        }
       }
       $592 = _sbrk($ssize$0$i | 0) | 0;
       $593 = ($592 | 0) == ($572 | 0);
       $ssize$0$$i = $593 ? $ssize$0$i : 0;
       if ($593) {
        $tbase$255$i = $572;
        $tsize$254$i = $ssize$0$$i;
        label = 194;
        break L258;
       } else {
        $br$0$ph$i = $592;
        $ssize$1$ph$i = $ssize$0$i;
        $tsize$0$ph$i = $ssize$0$$i;
        label = 184;
       }
      } else {
       $tsize$0323944$i = 0;
      }
     }
    }
   } while (0);
   L280 : do {
    if ((label | 0) == 184) {
     $604 = 0 - $ssize$1$ph$i | 0;
     $605 = ($br$0$ph$i | 0) != (-1 | 0);
     $606 = $ssize$1$ph$i >>> 0 < 2147483647;
     $or$cond5$i = $606 & $605;
     $607 = $545 >>> 0 > $ssize$1$ph$i >>> 0;
     $or$cond6$i = $607 & $or$cond5$i;
     do {
      if ($or$cond6$i) {
       $608 = HEAP32[856 >> 2] | 0;
       $609 = $547 - $ssize$1$ph$i | 0;
       $610 = $609 + $608 | 0;
       $611 = 0 - $608 | 0;
       $612 = $610 & $611;
       $613 = $612 >>> 0 < 2147483647;
       if ($613) {
        $614 = _sbrk($612 | 0) | 0;
        $615 = ($614 | 0) == (-1 | 0);
        if ($615) {
         _sbrk($604 | 0) | 0;
         $tsize$0323944$i = $tsize$0$ph$i;
         break L280;
        } else {
         $616 = $612 + $ssize$1$ph$i | 0;
         $ssize$2$i = $616;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$ph$i;
       }
      } else {
       $ssize$2$i = $ssize$1$ph$i;
      }
     } while (0);
     $617 = ($br$0$ph$i | 0) == (-1 | 0);
     if ($617) {
      $tsize$0323944$i = $tsize$0$ph$i;
     } else {
      $tbase$255$i = $br$0$ph$i;
      $tsize$254$i = $ssize$2$i;
      label = 194;
      break L258;
     }
    }
   } while (0);
   $618 = HEAP32[820 >> 2] | 0;
   $619 = $618 | 4;
   HEAP32[820 >> 2] = $619;
   $tsize$1$i = $tsize$0323944$i;
   label = 191;
  } else {
   $tsize$1$i = 0;
   label = 191;
  }
 } while (0);
 if ((label | 0) == 191) {
  $620 = $550 >>> 0 < 2147483647;
  if ($620) {
   $621 = _sbrk($550 | 0) | 0;
   $622 = _sbrk(0) | 0;
   $623 = ($621 | 0) != (-1 | 0);
   $624 = ($622 | 0) != (-1 | 0);
   $or$cond3$i = $623 & $624;
   $625 = $621 >>> 0 < $622 >>> 0;
   $or$cond8$i = $625 & $or$cond3$i;
   if ($or$cond8$i) {
    $626 = $622;
    $627 = $621;
    $628 = $626 - $627 | 0;
    $629 = $nb$0 + 40 | 0;
    $630 = $628 >>> 0 > $629 >>> 0;
    $$tsize$1$i = $630 ? $628 : $tsize$1$i;
    if ($630) {
     $tbase$255$i = $621;
     $tsize$254$i = $$tsize$1$i;
     label = 194;
    }
   }
  }
 }
 if ((label | 0) == 194) {
  $631 = HEAP32[808 >> 2] | 0;
  $632 = $631 + $tsize$254$i | 0;
  HEAP32[808 >> 2] = $632;
  $633 = HEAP32[812 >> 2] | 0;
  $634 = $632 >>> 0 > $633 >>> 0;
  if ($634) {
   HEAP32[812 >> 2] = $632;
  }
  $635 = HEAP32[400 >> 2] | 0;
  $636 = ($635 | 0) == (0 | 0);
  L299 : do {
   if ($636) {
    $637 = HEAP32[392 >> 2] | 0;
    $638 = ($637 | 0) == (0 | 0);
    $639 = $tbase$255$i >>> 0 < $637 >>> 0;
    $or$cond9$i = $638 | $639;
    if ($or$cond9$i) {
     HEAP32[392 >> 2] = $tbase$255$i;
    }
    HEAP32[824 >> 2] = $tbase$255$i;
    HEAP32[828 >> 2] = $tsize$254$i;
    HEAP32[836 >> 2] = 0;
    $640 = HEAP32[848 >> 2] | 0;
    HEAP32[412 >> 2] = $640;
    HEAP32[408 >> 2] = -1;
    $i$02$i$i = 0;
    while (1) {
     $641 = $i$02$i$i << 1;
     $642 = 416 + ($641 << 2) | 0;
     $$sum$i$i = $641 + 3 | 0;
     $643 = 416 + ($$sum$i$i << 2) | 0;
     HEAP32[$643 >> 2] = $642;
     $$sum1$i$i = $641 + 2 | 0;
     $644 = 416 + ($$sum1$i$i << 2) | 0;
     HEAP32[$644 >> 2] = $642;
     $645 = $i$02$i$i + 1 | 0;
     $exitcond$i$i = ($645 | 0) == 32;
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $645;
     }
    }
    $646 = $tsize$254$i + -40 | 0;
    $647 = $tbase$255$i + 8 | 0;
    $648 = $647;
    $649 = $648 & 7;
    $650 = ($649 | 0) == 0;
    $651 = 0 - $648 | 0;
    $652 = $651 & 7;
    $653 = $650 ? 0 : $652;
    $654 = $tbase$255$i + $653 | 0;
    $655 = $646 - $653 | 0;
    HEAP32[400 >> 2] = $654;
    HEAP32[388 >> 2] = $655;
    $656 = $655 | 1;
    $$sum$i13$i = $653 + 4 | 0;
    $657 = $tbase$255$i + $$sum$i13$i | 0;
    HEAP32[$657 >> 2] = $656;
    $$sum2$i$i = $tsize$254$i + -36 | 0;
    $658 = $tbase$255$i + $$sum2$i$i | 0;
    HEAP32[$658 >> 2] = 40;
    $659 = HEAP32[864 >> 2] | 0;
    HEAP32[404 >> 2] = $659;
   } else {
    $sp$084$i = 824;
    while (1) {
     $660 = HEAP32[$sp$084$i >> 2] | 0;
     $661 = $sp$084$i + 4 | 0;
     $662 = HEAP32[$661 >> 2] | 0;
     $663 = $660 + $662 | 0;
     $664 = ($tbase$255$i | 0) == ($663 | 0);
     if ($664) {
      $$lcssa222 = $660;
      $$lcssa224 = $661;
      $$lcssa226 = $662;
      $sp$084$i$lcssa = $sp$084$i;
      label = 204;
      break;
     }
     $665 = $sp$084$i + 8 | 0;
     $666 = HEAP32[$665 >> 2] | 0;
     $667 = ($666 | 0) == (0 | 0);
     if ($667) {
      break;
     } else {
      $sp$084$i = $666;
     }
    }
    if ((label | 0) == 204) {
     $668 = $sp$084$i$lcssa + 12 | 0;
     $669 = HEAP32[$668 >> 2] | 0;
     $670 = $669 & 8;
     $671 = ($670 | 0) == 0;
     if ($671) {
      $672 = $635 >>> 0 >= $$lcssa222 >>> 0;
      $673 = $635 >>> 0 < $tbase$255$i >>> 0;
      $or$cond57$i = $673 & $672;
      if ($or$cond57$i) {
       $674 = $$lcssa226 + $tsize$254$i | 0;
       HEAP32[$$lcssa224 >> 2] = $674;
       $675 = HEAP32[388 >> 2] | 0;
       $676 = $675 + $tsize$254$i | 0;
       $677 = $635 + 8 | 0;
       $678 = $677;
       $679 = $678 & 7;
       $680 = ($679 | 0) == 0;
       $681 = 0 - $678 | 0;
       $682 = $681 & 7;
       $683 = $680 ? 0 : $682;
       $684 = $635 + $683 | 0;
       $685 = $676 - $683 | 0;
       HEAP32[400 >> 2] = $684;
       HEAP32[388 >> 2] = $685;
       $686 = $685 | 1;
       $$sum$i17$i = $683 + 4 | 0;
       $687 = $635 + $$sum$i17$i | 0;
       HEAP32[$687 >> 2] = $686;
       $$sum2$i18$i = $676 + 4 | 0;
       $688 = $635 + $$sum2$i18$i | 0;
       HEAP32[$688 >> 2] = 40;
       $689 = HEAP32[864 >> 2] | 0;
       HEAP32[404 >> 2] = $689;
       break;
      }
     }
    }
    $690 = HEAP32[392 >> 2] | 0;
    $691 = $tbase$255$i >>> 0 < $690 >>> 0;
    if ($691) {
     HEAP32[392 >> 2] = $tbase$255$i;
     $755 = $tbase$255$i;
    } else {
     $755 = $690;
    }
    $692 = $tbase$255$i + $tsize$254$i | 0;
    $sp$183$i = 824;
    while (1) {
     $693 = HEAP32[$sp$183$i >> 2] | 0;
     $694 = ($693 | 0) == ($692 | 0);
     if ($694) {
      $$lcssa219 = $sp$183$i;
      $sp$183$i$lcssa = $sp$183$i;
      label = 212;
      break;
     }
     $695 = $sp$183$i + 8 | 0;
     $696 = HEAP32[$695 >> 2] | 0;
     $697 = ($696 | 0) == (0 | 0);
     if ($697) {
      $sp$0$i$i$i = 824;
      break;
     } else {
      $sp$183$i = $696;
     }
    }
    if ((label | 0) == 212) {
     $698 = $sp$183$i$lcssa + 12 | 0;
     $699 = HEAP32[$698 >> 2] | 0;
     $700 = $699 & 8;
     $701 = ($700 | 0) == 0;
     if ($701) {
      HEAP32[$$lcssa219 >> 2] = $tbase$255$i;
      $702 = $sp$183$i$lcssa + 4 | 0;
      $703 = HEAP32[$702 >> 2] | 0;
      $704 = $703 + $tsize$254$i | 0;
      HEAP32[$702 >> 2] = $704;
      $705 = $tbase$255$i + 8 | 0;
      $706 = $705;
      $707 = $706 & 7;
      $708 = ($707 | 0) == 0;
      $709 = 0 - $706 | 0;
      $710 = $709 & 7;
      $711 = $708 ? 0 : $710;
      $712 = $tbase$255$i + $711 | 0;
      $$sum112$i = $tsize$254$i + 8 | 0;
      $713 = $tbase$255$i + $$sum112$i | 0;
      $714 = $713;
      $715 = $714 & 7;
      $716 = ($715 | 0) == 0;
      $717 = 0 - $714 | 0;
      $718 = $717 & 7;
      $719 = $716 ? 0 : $718;
      $$sum113$i = $719 + $tsize$254$i | 0;
      $720 = $tbase$255$i + $$sum113$i | 0;
      $721 = $720;
      $722 = $712;
      $723 = $721 - $722 | 0;
      $$sum$i19$i = $711 + $nb$0 | 0;
      $724 = $tbase$255$i + $$sum$i19$i | 0;
      $725 = $723 - $nb$0 | 0;
      $726 = $nb$0 | 3;
      $$sum1$i20$i = $711 + 4 | 0;
      $727 = $tbase$255$i + $$sum1$i20$i | 0;
      HEAP32[$727 >> 2] = $726;
      $728 = ($720 | 0) == ($635 | 0);
      L324 : do {
       if ($728) {
        $729 = HEAP32[388 >> 2] | 0;
        $730 = $729 + $725 | 0;
        HEAP32[388 >> 2] = $730;
        HEAP32[400 >> 2] = $724;
        $731 = $730 | 1;
        $$sum42$i$i = $$sum$i19$i + 4 | 0;
        $732 = $tbase$255$i + $$sum42$i$i | 0;
        HEAP32[$732 >> 2] = $731;
       } else {
        $733 = HEAP32[396 >> 2] | 0;
        $734 = ($720 | 0) == ($733 | 0);
        if ($734) {
         $735 = HEAP32[384 >> 2] | 0;
         $736 = $735 + $725 | 0;
         HEAP32[384 >> 2] = $736;
         HEAP32[396 >> 2] = $724;
         $737 = $736 | 1;
         $$sum40$i$i = $$sum$i19$i + 4 | 0;
         $738 = $tbase$255$i + $$sum40$i$i | 0;
         HEAP32[$738 >> 2] = $737;
         $$sum41$i$i = $736 + $$sum$i19$i | 0;
         $739 = $tbase$255$i + $$sum41$i$i | 0;
         HEAP32[$739 >> 2] = $736;
         break;
        }
        $$sum2$i21$i = $tsize$254$i + 4 | 0;
        $$sum114$i = $$sum2$i21$i + $719 | 0;
        $740 = $tbase$255$i + $$sum114$i | 0;
        $741 = HEAP32[$740 >> 2] | 0;
        $742 = $741 & 3;
        $743 = ($742 | 0) == 1;
        if ($743) {
         $744 = $741 & -8;
         $745 = $741 >>> 3;
         $746 = $741 >>> 0 < 256;
         L332 : do {
          if ($746) {
           $$sum3738$i$i = $719 | 8;
           $$sum124$i = $$sum3738$i$i + $tsize$254$i | 0;
           $747 = $tbase$255$i + $$sum124$i | 0;
           $748 = HEAP32[$747 >> 2] | 0;
           $$sum39$i$i = $tsize$254$i + 12 | 0;
           $$sum125$i = $$sum39$i$i + $719 | 0;
           $749 = $tbase$255$i + $$sum125$i | 0;
           $750 = HEAP32[$749 >> 2] | 0;
           $751 = $745 << 1;
           $752 = 416 + ($751 << 2) | 0;
           $753 = ($748 | 0) == ($752 | 0);
           do {
            if (!$753) {
             $754 = $748 >>> 0 < $755 >>> 0;
             if ($754) {
              _abort();
             }
             $756 = $748 + 12 | 0;
             $757 = HEAP32[$756 >> 2] | 0;
             $758 = ($757 | 0) == ($720 | 0);
             if ($758) {
              break;
             }
             _abort();
            }
           } while (0);
           $759 = ($750 | 0) == ($748 | 0);
           if ($759) {
            $760 = 1 << $745;
            $761 = $760 ^ -1;
            $762 = HEAP32[376 >> 2] | 0;
            $763 = $762 & $761;
            HEAP32[376 >> 2] = $763;
            break;
           }
           $764 = ($750 | 0) == ($752 | 0);
           do {
            if ($764) {
             $$pre57$i$i = $750 + 8 | 0;
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $765 = $750 >>> 0 < $755 >>> 0;
             if ($765) {
              _abort();
             }
             $766 = $750 + 8 | 0;
             $767 = HEAP32[$766 >> 2] | 0;
             $768 = ($767 | 0) == ($720 | 0);
             if ($768) {
              $$pre$phi58$i$iZ2D = $766;
              break;
             }
             _abort();
            }
           } while (0);
           $769 = $748 + 12 | 0;
           HEAP32[$769 >> 2] = $750;
           HEAP32[$$pre$phi58$i$iZ2D >> 2] = $748;
          } else {
           $$sum34$i$i = $719 | 24;
           $$sum115$i = $$sum34$i$i + $tsize$254$i | 0;
           $770 = $tbase$255$i + $$sum115$i | 0;
           $771 = HEAP32[$770 >> 2] | 0;
           $$sum5$i$i = $tsize$254$i + 12 | 0;
           $$sum116$i = $$sum5$i$i + $719 | 0;
           $772 = $tbase$255$i + $$sum116$i | 0;
           $773 = HEAP32[$772 >> 2] | 0;
           $774 = ($773 | 0) == ($720 | 0);
           do {
            if ($774) {
             $$sum67$i$i = $719 | 16;
             $$sum122$i = $$sum2$i21$i + $$sum67$i$i | 0;
             $784 = $tbase$255$i + $$sum122$i | 0;
             $785 = HEAP32[$784 >> 2] | 0;
             $786 = ($785 | 0) == (0 | 0);
             if ($786) {
              $$sum123$i = $$sum67$i$i + $tsize$254$i | 0;
              $787 = $tbase$255$i + $$sum123$i | 0;
              $788 = HEAP32[$787 >> 2] | 0;
              $789 = ($788 | 0) == (0 | 0);
              if ($789) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $788;
               $RP$0$i$i = $787;
              }
             } else {
              $R$0$i$i = $785;
              $RP$0$i$i = $784;
             }
             while (1) {
              $790 = $R$0$i$i + 20 | 0;
              $791 = HEAP32[$790 >> 2] | 0;
              $792 = ($791 | 0) == (0 | 0);
              if (!$792) {
               $R$0$i$i = $791;
               $RP$0$i$i = $790;
               continue;
              }
              $793 = $R$0$i$i + 16 | 0;
              $794 = HEAP32[$793 >> 2] | 0;
              $795 = ($794 | 0) == (0 | 0);
              if ($795) {
               $R$0$i$i$lcssa = $R$0$i$i;
               $RP$0$i$i$lcssa = $RP$0$i$i;
               break;
              } else {
               $R$0$i$i = $794;
               $RP$0$i$i = $793;
              }
             }
             $796 = $RP$0$i$i$lcssa >>> 0 < $755 >>> 0;
             if ($796) {
              _abort();
             } else {
              HEAP32[$RP$0$i$i$lcssa >> 2] = 0;
              $R$1$i$i = $R$0$i$i$lcssa;
              break;
             }
            } else {
             $$sum3536$i$i = $719 | 8;
             $$sum117$i = $$sum3536$i$i + $tsize$254$i | 0;
             $775 = $tbase$255$i + $$sum117$i | 0;
             $776 = HEAP32[$775 >> 2] | 0;
             $777 = $776 >>> 0 < $755 >>> 0;
             if ($777) {
              _abort();
             }
             $778 = $776 + 12 | 0;
             $779 = HEAP32[$778 >> 2] | 0;
             $780 = ($779 | 0) == ($720 | 0);
             if (!$780) {
              _abort();
             }
             $781 = $773 + 8 | 0;
             $782 = HEAP32[$781 >> 2] | 0;
             $783 = ($782 | 0) == ($720 | 0);
             if ($783) {
              HEAP32[$778 >> 2] = $773;
              HEAP32[$781 >> 2] = $776;
              $R$1$i$i = $773;
              break;
             } else {
              _abort();
             }
            }
           } while (0);
           $797 = ($771 | 0) == (0 | 0);
           if ($797) {
            break;
           }
           $$sum30$i$i = $tsize$254$i + 28 | 0;
           $$sum118$i = $$sum30$i$i + $719 | 0;
           $798 = $tbase$255$i + $$sum118$i | 0;
           $799 = HEAP32[$798 >> 2] | 0;
           $800 = 680 + ($799 << 2) | 0;
           $801 = HEAP32[$800 >> 2] | 0;
           $802 = ($720 | 0) == ($801 | 0);
           do {
            if ($802) {
             HEAP32[$800 >> 2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i | 0) == (0 | 0);
             if (!$cond$i$i) {
              break;
             }
             $803 = 1 << $799;
             $804 = $803 ^ -1;
             $805 = HEAP32[380 >> 2] | 0;
             $806 = $805 & $804;
             HEAP32[380 >> 2] = $806;
             break L332;
            } else {
             $807 = HEAP32[392 >> 2] | 0;
             $808 = $771 >>> 0 < $807 >>> 0;
             if ($808) {
              _abort();
             }
             $809 = $771 + 16 | 0;
             $810 = HEAP32[$809 >> 2] | 0;
             $811 = ($810 | 0) == ($720 | 0);
             if ($811) {
              HEAP32[$809 >> 2] = $R$1$i$i;
             } else {
              $812 = $771 + 20 | 0;
              HEAP32[$812 >> 2] = $R$1$i$i;
             }
             $813 = ($R$1$i$i | 0) == (0 | 0);
             if ($813) {
              break L332;
             }
            }
           } while (0);
           $814 = HEAP32[392 >> 2] | 0;
           $815 = $R$1$i$i >>> 0 < $814 >>> 0;
           if ($815) {
            _abort();
           }
           $816 = $R$1$i$i + 24 | 0;
           HEAP32[$816 >> 2] = $771;
           $$sum3132$i$i = $719 | 16;
           $$sum119$i = $$sum3132$i$i + $tsize$254$i | 0;
           $817 = $tbase$255$i + $$sum119$i | 0;
           $818 = HEAP32[$817 >> 2] | 0;
           $819 = ($818 | 0) == (0 | 0);
           do {
            if (!$819) {
             $820 = $818 >>> 0 < $814 >>> 0;
             if ($820) {
              _abort();
             } else {
              $821 = $R$1$i$i + 16 | 0;
              HEAP32[$821 >> 2] = $818;
              $822 = $818 + 24 | 0;
              HEAP32[$822 >> 2] = $R$1$i$i;
              break;
             }
            }
           } while (0);
           $$sum120$i = $$sum2$i21$i + $$sum3132$i$i | 0;
           $823 = $tbase$255$i + $$sum120$i | 0;
           $824 = HEAP32[$823 >> 2] | 0;
           $825 = ($824 | 0) == (0 | 0);
           if ($825) {
            break;
           }
           $826 = HEAP32[392 >> 2] | 0;
           $827 = $824 >>> 0 < $826 >>> 0;
           if ($827) {
            _abort();
           } else {
            $828 = $R$1$i$i + 20 | 0;
            HEAP32[$828 >> 2] = $824;
            $829 = $824 + 24 | 0;
            HEAP32[$829 >> 2] = $R$1$i$i;
            break;
           }
          }
         } while (0);
         $$sum9$i$i = $744 | $719;
         $$sum121$i = $$sum9$i$i + $tsize$254$i | 0;
         $830 = $tbase$255$i + $$sum121$i | 0;
         $831 = $744 + $725 | 0;
         $oldfirst$0$i$i = $830;
         $qsize$0$i$i = $831;
        } else {
         $oldfirst$0$i$i = $720;
         $qsize$0$i$i = $725;
        }
        $832 = $oldfirst$0$i$i + 4 | 0;
        $833 = HEAP32[$832 >> 2] | 0;
        $834 = $833 & -2;
        HEAP32[$832 >> 2] = $834;
        $835 = $qsize$0$i$i | 1;
        $$sum10$i$i = $$sum$i19$i + 4 | 0;
        $836 = $tbase$255$i + $$sum10$i$i | 0;
        HEAP32[$836 >> 2] = $835;
        $$sum11$i$i = $qsize$0$i$i + $$sum$i19$i | 0;
        $837 = $tbase$255$i + $$sum11$i$i | 0;
        HEAP32[$837 >> 2] = $qsize$0$i$i;
        $838 = $qsize$0$i$i >>> 3;
        $839 = $qsize$0$i$i >>> 0 < 256;
        if ($839) {
         $840 = $838 << 1;
         $841 = 416 + ($840 << 2) | 0;
         $842 = HEAP32[376 >> 2] | 0;
         $843 = 1 << $838;
         $844 = $842 & $843;
         $845 = ($844 | 0) == 0;
         do {
          if ($845) {
           $846 = $842 | $843;
           HEAP32[376 >> 2] = $846;
           $$pre$i22$i = $840 + 2 | 0;
           $$pre56$i$i = 416 + ($$pre$i22$i << 2) | 0;
           $$pre$phi$i23$iZ2D = $$pre56$i$i;
           $F4$0$i$i = $841;
          } else {
           $$sum29$i$i = $840 + 2 | 0;
           $847 = 416 + ($$sum29$i$i << 2) | 0;
           $848 = HEAP32[$847 >> 2] | 0;
           $849 = HEAP32[392 >> 2] | 0;
           $850 = $848 >>> 0 < $849 >>> 0;
           if (!$850) {
            $$pre$phi$i23$iZ2D = $847;
            $F4$0$i$i = $848;
            break;
           }
           _abort();
          }
         } while (0);
         HEAP32[$$pre$phi$i23$iZ2D >> 2] = $724;
         $851 = $F4$0$i$i + 12 | 0;
         HEAP32[$851 >> 2] = $724;
         $$sum27$i$i = $$sum$i19$i + 8 | 0;
         $852 = $tbase$255$i + $$sum27$i$i | 0;
         HEAP32[$852 >> 2] = $F4$0$i$i;
         $$sum28$i$i = $$sum$i19$i + 12 | 0;
         $853 = $tbase$255$i + $$sum28$i$i | 0;
         HEAP32[$853 >> 2] = $841;
         break;
        }
        $854 = $qsize$0$i$i >>> 8;
        $855 = ($854 | 0) == 0;
        do {
         if ($855) {
          $I7$0$i$i = 0;
         } else {
          $856 = $qsize$0$i$i >>> 0 > 16777215;
          if ($856) {
           $I7$0$i$i = 31;
           break;
          }
          $857 = $854 + 1048320 | 0;
          $858 = $857 >>> 16;
          $859 = $858 & 8;
          $860 = $854 << $859;
          $861 = $860 + 520192 | 0;
          $862 = $861 >>> 16;
          $863 = $862 & 4;
          $864 = $863 | $859;
          $865 = $860 << $863;
          $866 = $865 + 245760 | 0;
          $867 = $866 >>> 16;
          $868 = $867 & 2;
          $869 = $864 | $868;
          $870 = 14 - $869 | 0;
          $871 = $865 << $868;
          $872 = $871 >>> 15;
          $873 = $870 + $872 | 0;
          $874 = $873 << 1;
          $875 = $873 + 7 | 0;
          $876 = $qsize$0$i$i >>> $875;
          $877 = $876 & 1;
          $878 = $877 | $874;
          $I7$0$i$i = $878;
         }
        } while (0);
        $879 = 680 + ($I7$0$i$i << 2) | 0;
        $$sum12$i$i = $$sum$i19$i + 28 | 0;
        $880 = $tbase$255$i + $$sum12$i$i | 0;
        HEAP32[$880 >> 2] = $I7$0$i$i;
        $$sum13$i$i = $$sum$i19$i + 16 | 0;
        $881 = $tbase$255$i + $$sum13$i$i | 0;
        $$sum14$i$i = $$sum$i19$i + 20 | 0;
        $882 = $tbase$255$i + $$sum14$i$i | 0;
        HEAP32[$882 >> 2] = 0;
        HEAP32[$881 >> 2] = 0;
        $883 = HEAP32[380 >> 2] | 0;
        $884 = 1 << $I7$0$i$i;
        $885 = $883 & $884;
        $886 = ($885 | 0) == 0;
        if ($886) {
         $887 = $883 | $884;
         HEAP32[380 >> 2] = $887;
         HEAP32[$879 >> 2] = $724;
         $$sum15$i$i = $$sum$i19$i + 24 | 0;
         $888 = $tbase$255$i + $$sum15$i$i | 0;
         HEAP32[$888 >> 2] = $879;
         $$sum16$i$i = $$sum$i19$i + 12 | 0;
         $889 = $tbase$255$i + $$sum16$i$i | 0;
         HEAP32[$889 >> 2] = $724;
         $$sum17$i$i = $$sum$i19$i + 8 | 0;
         $890 = $tbase$255$i + $$sum17$i$i | 0;
         HEAP32[$890 >> 2] = $724;
         break;
        }
        $891 = HEAP32[$879 >> 2] | 0;
        $892 = $891 + 4 | 0;
        $893 = HEAP32[$892 >> 2] | 0;
        $894 = $893 & -8;
        $895 = ($894 | 0) == ($qsize$0$i$i | 0);
        L418 : do {
         if ($895) {
          $T$0$lcssa$i25$i = $891;
         } else {
          $896 = ($I7$0$i$i | 0) == 31;
          $897 = $I7$0$i$i >>> 1;
          $898 = 25 - $897 | 0;
          $899 = $896 ? 0 : $898;
          $900 = $qsize$0$i$i << $899;
          $K8$051$i$i = $900;
          $T$050$i$i = $891;
          while (1) {
           $907 = $K8$051$i$i >>> 31;
           $908 = ($T$050$i$i + 16 | 0) + ($907 << 2) | 0;
           $903 = HEAP32[$908 >> 2] | 0;
           $909 = ($903 | 0) == (0 | 0);
           if ($909) {
            $$lcssa = $908;
            $T$050$i$i$lcssa = $T$050$i$i;
            break;
           }
           $901 = $K8$051$i$i << 1;
           $902 = $903 + 4 | 0;
           $904 = HEAP32[$902 >> 2] | 0;
           $905 = $904 & -8;
           $906 = ($905 | 0) == ($qsize$0$i$i | 0);
           if ($906) {
            $T$0$lcssa$i25$i = $903;
            break L418;
           } else {
            $K8$051$i$i = $901;
            $T$050$i$i = $903;
           }
          }
          $910 = HEAP32[392 >> 2] | 0;
          $911 = $$lcssa >>> 0 < $910 >>> 0;
          if ($911) {
           _abort();
          } else {
           HEAP32[$$lcssa >> 2] = $724;
           $$sum23$i$i = $$sum$i19$i + 24 | 0;
           $912 = $tbase$255$i + $$sum23$i$i | 0;
           HEAP32[$912 >> 2] = $T$050$i$i$lcssa;
           $$sum24$i$i = $$sum$i19$i + 12 | 0;
           $913 = $tbase$255$i + $$sum24$i$i | 0;
           HEAP32[$913 >> 2] = $724;
           $$sum25$i$i = $$sum$i19$i + 8 | 0;
           $914 = $tbase$255$i + $$sum25$i$i | 0;
           HEAP32[$914 >> 2] = $724;
           break L324;
          }
         }
        } while (0);
        $915 = $T$0$lcssa$i25$i + 8 | 0;
        $916 = HEAP32[$915 >> 2] | 0;
        $917 = HEAP32[392 >> 2] | 0;
        $918 = $916 >>> 0 >= $917 >>> 0;
        $not$$i26$i = $T$0$lcssa$i25$i >>> 0 >= $917 >>> 0;
        $919 = $918 & $not$$i26$i;
        if ($919) {
         $920 = $916 + 12 | 0;
         HEAP32[$920 >> 2] = $724;
         HEAP32[$915 >> 2] = $724;
         $$sum20$i$i = $$sum$i19$i + 8 | 0;
         $921 = $tbase$255$i + $$sum20$i$i | 0;
         HEAP32[$921 >> 2] = $916;
         $$sum21$i$i = $$sum$i19$i + 12 | 0;
         $922 = $tbase$255$i + $$sum21$i$i | 0;
         HEAP32[$922 >> 2] = $T$0$lcssa$i25$i;
         $$sum22$i$i = $$sum$i19$i + 24 | 0;
         $923 = $tbase$255$i + $$sum22$i$i | 0;
         HEAP32[$923 >> 2] = 0;
         break;
        } else {
         _abort();
        }
       }
      } while (0);
      $$sum1819$i$i = $711 | 8;
      $924 = $tbase$255$i + $$sum1819$i$i | 0;
      $mem$0 = $924;
      return $mem$0 | 0;
     } else {
      $sp$0$i$i$i = 824;
     }
    }
    while (1) {
     $925 = HEAP32[$sp$0$i$i$i >> 2] | 0;
     $926 = $925 >>> 0 > $635 >>> 0;
     if (!$926) {
      $927 = $sp$0$i$i$i + 4 | 0;
      $928 = HEAP32[$927 >> 2] | 0;
      $929 = $925 + $928 | 0;
      $930 = $929 >>> 0 > $635 >>> 0;
      if ($930) {
       $$lcssa215 = $925;
       $$lcssa216 = $928;
       $$lcssa217 = $929;
       break;
      }
     }
     $931 = $sp$0$i$i$i + 8 | 0;
     $932 = HEAP32[$931 >> 2] | 0;
     $sp$0$i$i$i = $932;
    }
    $$sum$i14$i = $$lcssa216 + -47 | 0;
    $$sum1$i15$i = $$lcssa216 + -39 | 0;
    $933 = $$lcssa215 + $$sum1$i15$i | 0;
    $934 = $933;
    $935 = $934 & 7;
    $936 = ($935 | 0) == 0;
    $937 = 0 - $934 | 0;
    $938 = $937 & 7;
    $939 = $936 ? 0 : $938;
    $$sum2$i16$i = $$sum$i14$i + $939 | 0;
    $940 = $$lcssa215 + $$sum2$i16$i | 0;
    $941 = $635 + 16 | 0;
    $942 = $940 >>> 0 < $941 >>> 0;
    $943 = $942 ? $635 : $940;
    $944 = $943 + 8 | 0;
    $945 = $tsize$254$i + -40 | 0;
    $946 = $tbase$255$i + 8 | 0;
    $947 = $946;
    $948 = $947 & 7;
    $949 = ($948 | 0) == 0;
    $950 = 0 - $947 | 0;
    $951 = $950 & 7;
    $952 = $949 ? 0 : $951;
    $953 = $tbase$255$i + $952 | 0;
    $954 = $945 - $952 | 0;
    HEAP32[400 >> 2] = $953;
    HEAP32[388 >> 2] = $954;
    $955 = $954 | 1;
    $$sum$i$i$i = $952 + 4 | 0;
    $956 = $tbase$255$i + $$sum$i$i$i | 0;
    HEAP32[$956 >> 2] = $955;
    $$sum2$i$i$i = $tsize$254$i + -36 | 0;
    $957 = $tbase$255$i + $$sum2$i$i$i | 0;
    HEAP32[$957 >> 2] = 40;
    $958 = HEAP32[864 >> 2] | 0;
    HEAP32[404 >> 2] = $958;
    $959 = $943 + 4 | 0;
    HEAP32[$959 >> 2] = 27;
    HEAP32[$944 >> 2] = HEAP32[824 >> 2] | 0;
    HEAP32[$944 + 4 >> 2] = HEAP32[824 + 4 >> 2] | 0;
    HEAP32[$944 + 8 >> 2] = HEAP32[824 + 8 >> 2] | 0;
    HEAP32[$944 + 12 >> 2] = HEAP32[824 + 12 >> 2] | 0;
    HEAP32[824 >> 2] = $tbase$255$i;
    HEAP32[828 >> 2] = $tsize$254$i;
    HEAP32[836 >> 2] = 0;
    HEAP32[832 >> 2] = $944;
    $960 = $943 + 28 | 0;
    HEAP32[$960 >> 2] = 7;
    $961 = $943 + 32 | 0;
    $962 = $961 >>> 0 < $$lcssa217 >>> 0;
    if ($962) {
     $964 = $960;
     while (1) {
      $963 = $964 + 4 | 0;
      HEAP32[$963 >> 2] = 7;
      $965 = $964 + 8 | 0;
      $966 = $965 >>> 0 < $$lcssa217 >>> 0;
      if ($966) {
       $964 = $963;
      } else {
       break;
      }
     }
    }
    $967 = ($943 | 0) == ($635 | 0);
    if (!$967) {
     $968 = $943;
     $969 = $635;
     $970 = $968 - $969 | 0;
     $971 = HEAP32[$959 >> 2] | 0;
     $972 = $971 & -2;
     HEAP32[$959 >> 2] = $972;
     $973 = $970 | 1;
     $974 = $635 + 4 | 0;
     HEAP32[$974 >> 2] = $973;
     HEAP32[$943 >> 2] = $970;
     $975 = $970 >>> 3;
     $976 = $970 >>> 0 < 256;
     if ($976) {
      $977 = $975 << 1;
      $978 = 416 + ($977 << 2) | 0;
      $979 = HEAP32[376 >> 2] | 0;
      $980 = 1 << $975;
      $981 = $979 & $980;
      $982 = ($981 | 0) == 0;
      if ($982) {
       $983 = $979 | $980;
       HEAP32[376 >> 2] = $983;
       $$pre$i$i = $977 + 2 | 0;
       $$pre14$i$i = 416 + ($$pre$i$i << 2) | 0;
       $$pre$phi$i$iZ2D = $$pre14$i$i;
       $F$0$i$i = $978;
      } else {
       $$sum4$i$i = $977 + 2 | 0;
       $984 = 416 + ($$sum4$i$i << 2) | 0;
       $985 = HEAP32[$984 >> 2] | 0;
       $986 = HEAP32[392 >> 2] | 0;
       $987 = $985 >>> 0 < $986 >>> 0;
       if ($987) {
        _abort();
       } else {
        $$pre$phi$i$iZ2D = $984;
        $F$0$i$i = $985;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D >> 2] = $635;
      $988 = $F$0$i$i + 12 | 0;
      HEAP32[$988 >> 2] = $635;
      $989 = $635 + 8 | 0;
      HEAP32[$989 >> 2] = $F$0$i$i;
      $990 = $635 + 12 | 0;
      HEAP32[$990 >> 2] = $978;
      break;
     }
     $991 = $970 >>> 8;
     $992 = ($991 | 0) == 0;
     if ($992) {
      $I1$0$i$i = 0;
     } else {
      $993 = $970 >>> 0 > 16777215;
      if ($993) {
       $I1$0$i$i = 31;
      } else {
       $994 = $991 + 1048320 | 0;
       $995 = $994 >>> 16;
       $996 = $995 & 8;
       $997 = $991 << $996;
       $998 = $997 + 520192 | 0;
       $999 = $998 >>> 16;
       $1000 = $999 & 4;
       $1001 = $1000 | $996;
       $1002 = $997 << $1000;
       $1003 = $1002 + 245760 | 0;
       $1004 = $1003 >>> 16;
       $1005 = $1004 & 2;
       $1006 = $1001 | $1005;
       $1007 = 14 - $1006 | 0;
       $1008 = $1002 << $1005;
       $1009 = $1008 >>> 15;
       $1010 = $1007 + $1009 | 0;
       $1011 = $1010 << 1;
       $1012 = $1010 + 7 | 0;
       $1013 = $970 >>> $1012;
       $1014 = $1013 & 1;
       $1015 = $1014 | $1011;
       $I1$0$i$i = $1015;
      }
     }
     $1016 = 680 + ($I1$0$i$i << 2) | 0;
     $1017 = $635 + 28 | 0;
     HEAP32[$1017 >> 2] = $I1$0$i$i;
     $1018 = $635 + 20 | 0;
     HEAP32[$1018 >> 2] = 0;
     HEAP32[$941 >> 2] = 0;
     $1019 = HEAP32[380 >> 2] | 0;
     $1020 = 1 << $I1$0$i$i;
     $1021 = $1019 & $1020;
     $1022 = ($1021 | 0) == 0;
     if ($1022) {
      $1023 = $1019 | $1020;
      HEAP32[380 >> 2] = $1023;
      HEAP32[$1016 >> 2] = $635;
      $1024 = $635 + 24 | 0;
      HEAP32[$1024 >> 2] = $1016;
      $1025 = $635 + 12 | 0;
      HEAP32[$1025 >> 2] = $635;
      $1026 = $635 + 8 | 0;
      HEAP32[$1026 >> 2] = $635;
      break;
     }
     $1027 = HEAP32[$1016 >> 2] | 0;
     $1028 = $1027 + 4 | 0;
     $1029 = HEAP32[$1028 >> 2] | 0;
     $1030 = $1029 & -8;
     $1031 = ($1030 | 0) == ($970 | 0);
     L459 : do {
      if ($1031) {
       $T$0$lcssa$i$i = $1027;
      } else {
       $1032 = ($I1$0$i$i | 0) == 31;
       $1033 = $I1$0$i$i >>> 1;
       $1034 = 25 - $1033 | 0;
       $1035 = $1032 ? 0 : $1034;
       $1036 = $970 << $1035;
       $K2$07$i$i = $1036;
       $T$06$i$i = $1027;
       while (1) {
        $1043 = $K2$07$i$i >>> 31;
        $1044 = ($T$06$i$i + 16 | 0) + ($1043 << 2) | 0;
        $1039 = HEAP32[$1044 >> 2] | 0;
        $1045 = ($1039 | 0) == (0 | 0);
        if ($1045) {
         $$lcssa211 = $1044;
         $T$06$i$i$lcssa = $T$06$i$i;
         break;
        }
        $1037 = $K2$07$i$i << 1;
        $1038 = $1039 + 4 | 0;
        $1040 = HEAP32[$1038 >> 2] | 0;
        $1041 = $1040 & -8;
        $1042 = ($1041 | 0) == ($970 | 0);
        if ($1042) {
         $T$0$lcssa$i$i = $1039;
         break L459;
        } else {
         $K2$07$i$i = $1037;
         $T$06$i$i = $1039;
        }
       }
       $1046 = HEAP32[392 >> 2] | 0;
       $1047 = $$lcssa211 >>> 0 < $1046 >>> 0;
       if ($1047) {
        _abort();
       } else {
        HEAP32[$$lcssa211 >> 2] = $635;
        $1048 = $635 + 24 | 0;
        HEAP32[$1048 >> 2] = $T$06$i$i$lcssa;
        $1049 = $635 + 12 | 0;
        HEAP32[$1049 >> 2] = $635;
        $1050 = $635 + 8 | 0;
        HEAP32[$1050 >> 2] = $635;
        break L299;
       }
      }
     } while (0);
     $1051 = $T$0$lcssa$i$i + 8 | 0;
     $1052 = HEAP32[$1051 >> 2] | 0;
     $1053 = HEAP32[392 >> 2] | 0;
     $1054 = $1052 >>> 0 >= $1053 >>> 0;
     $not$$i$i = $T$0$lcssa$i$i >>> 0 >= $1053 >>> 0;
     $1055 = $1054 & $not$$i$i;
     if ($1055) {
      $1056 = $1052 + 12 | 0;
      HEAP32[$1056 >> 2] = $635;
      HEAP32[$1051 >> 2] = $635;
      $1057 = $635 + 8 | 0;
      HEAP32[$1057 >> 2] = $1052;
      $1058 = $635 + 12 | 0;
      HEAP32[$1058 >> 2] = $T$0$lcssa$i$i;
      $1059 = $635 + 24 | 0;
      HEAP32[$1059 >> 2] = 0;
      break;
     } else {
      _abort();
     }
    }
   }
  } while (0);
  $1060 = HEAP32[388 >> 2] | 0;
  $1061 = $1060 >>> 0 > $nb$0 >>> 0;
  if ($1061) {
   $1062 = $1060 - $nb$0 | 0;
   HEAP32[388 >> 2] = $1062;
   $1063 = HEAP32[400 >> 2] | 0;
   $1064 = $1063 + $nb$0 | 0;
   HEAP32[400 >> 2] = $1064;
   $1065 = $1062 | 1;
   $$sum$i32 = $nb$0 + 4 | 0;
   $1066 = $1063 + $$sum$i32 | 0;
   HEAP32[$1066 >> 2] = $1065;
   $1067 = $nb$0 | 3;
   $1068 = $1063 + 4 | 0;
   HEAP32[$1068 >> 2] = $1067;
   $1069 = $1063 + 8 | 0;
   $mem$0 = $1069;
   return $mem$0 | 0;
  }
 }
 $1070 = ___errno_location() | 0;
 HEAP32[$1070 >> 2] = 12;
 $mem$0 = 0;
 return $mem$0 | 0;
}

function _free($mem) {
 $mem = $mem | 0;
 var $$lcssa = 0, $$pre = 0, $$pre$phi59Z2D = 0, $$pre$phi61Z2D = 0, $$pre$phiZ2D = 0, $$pre57 = 0, $$pre58 = 0, $$pre60 = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum1718 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0;
 var $$sum25 = 0, $$sum26 = 0, $$sum27 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
 var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
 var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0;
 var $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0;
 var $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0;
 var $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
 var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
 var $321 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0;
 var $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0;
 var $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0;
 var $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $K19$052 = 0, $R$0 = 0, $R$0$lcssa = 0, $R$1 = 0;
 var $R7$0 = 0, $R7$0$lcssa = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$lcssa = 0, $RP9$0 = 0, $RP9$0$lcssa = 0, $T$0$lcssa = 0, $T$051 = 0, $T$051$lcssa = 0, $cond = 0, $cond47 = 0, $not$ = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem | 0) == (0 | 0);
 if ($0) {
  return;
 }
 $1 = $mem + -8 | 0;
 $2 = HEAP32[392 >> 2] | 0;
 $3 = $1 >>> 0 < $2 >>> 0;
 if ($3) {
  _abort();
 }
 $4 = $mem + -4 | 0;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = $5 & 3;
 $7 = ($6 | 0) == 1;
 if ($7) {
  _abort();
 }
 $8 = $5 & -8;
 $$sum = $8 + -8 | 0;
 $9 = $mem + $$sum | 0;
 $10 = $5 & 1;
 $11 = ($10 | 0) == 0;
 do {
  if ($11) {
   $12 = HEAP32[$1 >> 2] | 0;
   $13 = ($6 | 0) == 0;
   if ($13) {
    return;
   }
   $$sum2 = -8 - $12 | 0;
   $14 = $mem + $$sum2 | 0;
   $15 = $12 + $8 | 0;
   $16 = $14 >>> 0 < $2 >>> 0;
   if ($16) {
    _abort();
   }
   $17 = HEAP32[396 >> 2] | 0;
   $18 = ($14 | 0) == ($17 | 0);
   if ($18) {
    $$sum3 = $8 + -4 | 0;
    $103 = $mem + $$sum3 | 0;
    $104 = HEAP32[$103 >> 2] | 0;
    $105 = $104 & 3;
    $106 = ($105 | 0) == 3;
    if (!$106) {
     $p$0 = $14;
     $psize$0 = $15;
     break;
    }
    HEAP32[384 >> 2] = $15;
    $107 = $104 & -2;
    HEAP32[$103 >> 2] = $107;
    $108 = $15 | 1;
    $$sum20 = $$sum2 + 4 | 0;
    $109 = $mem + $$sum20 | 0;
    HEAP32[$109 >> 2] = $108;
    HEAP32[$9 >> 2] = $15;
    return;
   }
   $19 = $12 >>> 3;
   $20 = $12 >>> 0 < 256;
   if ($20) {
    $$sum30 = $$sum2 + 8 | 0;
    $21 = $mem + $$sum30 | 0;
    $22 = HEAP32[$21 >> 2] | 0;
    $$sum31 = $$sum2 + 12 | 0;
    $23 = $mem + $$sum31 | 0;
    $24 = HEAP32[$23 >> 2] | 0;
    $25 = $19 << 1;
    $26 = 416 + ($25 << 2) | 0;
    $27 = ($22 | 0) == ($26 | 0);
    if (!$27) {
     $28 = $22 >>> 0 < $2 >>> 0;
     if ($28) {
      _abort();
     }
     $29 = $22 + 12 | 0;
     $30 = HEAP32[$29 >> 2] | 0;
     $31 = ($30 | 0) == ($14 | 0);
     if (!$31) {
      _abort();
     }
    }
    $32 = ($24 | 0) == ($22 | 0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[376 >> 2] | 0;
     $36 = $35 & $34;
     HEAP32[376 >> 2] = $36;
     $p$0 = $14;
     $psize$0 = $15;
     break;
    }
    $37 = ($24 | 0) == ($26 | 0);
    if ($37) {
     $$pre60 = $24 + 8 | 0;
     $$pre$phi61Z2D = $$pre60;
    } else {
     $38 = $24 >>> 0 < $2 >>> 0;
     if ($38) {
      _abort();
     }
     $39 = $24 + 8 | 0;
     $40 = HEAP32[$39 >> 2] | 0;
     $41 = ($40 | 0) == ($14 | 0);
     if ($41) {
      $$pre$phi61Z2D = $39;
     } else {
      _abort();
     }
    }
    $42 = $22 + 12 | 0;
    HEAP32[$42 >> 2] = $24;
    HEAP32[$$pre$phi61Z2D >> 2] = $22;
    $p$0 = $14;
    $psize$0 = $15;
    break;
   }
   $$sum22 = $$sum2 + 24 | 0;
   $43 = $mem + $$sum22 | 0;
   $44 = HEAP32[$43 >> 2] | 0;
   $$sum23 = $$sum2 + 12 | 0;
   $45 = $mem + $$sum23 | 0;
   $46 = HEAP32[$45 >> 2] | 0;
   $47 = ($46 | 0) == ($14 | 0);
   do {
    if ($47) {
     $$sum25 = $$sum2 + 20 | 0;
     $57 = $mem + $$sum25 | 0;
     $58 = HEAP32[$57 >> 2] | 0;
     $59 = ($58 | 0) == (0 | 0);
     if ($59) {
      $$sum24 = $$sum2 + 16 | 0;
      $60 = $mem + $$sum24 | 0;
      $61 = HEAP32[$60 >> 2] | 0;
      $62 = ($61 | 0) == (0 | 0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;
       $RP$0 = $60;
      }
     } else {
      $R$0 = $58;
      $RP$0 = $57;
     }
     while (1) {
      $63 = $R$0 + 20 | 0;
      $64 = HEAP32[$63 >> 2] | 0;
      $65 = ($64 | 0) == (0 | 0);
      if (!$65) {
       $R$0 = $64;
       $RP$0 = $63;
       continue;
      }
      $66 = $R$0 + 16 | 0;
      $67 = HEAP32[$66 >> 2] | 0;
      $68 = ($67 | 0) == (0 | 0);
      if ($68) {
       $R$0$lcssa = $R$0;
       $RP$0$lcssa = $RP$0;
       break;
      } else {
       $R$0 = $67;
       $RP$0 = $66;
      }
     }
     $69 = $RP$0$lcssa >>> 0 < $2 >>> 0;
     if ($69) {
      _abort();
     } else {
      HEAP32[$RP$0$lcssa >> 2] = 0;
      $R$1 = $R$0$lcssa;
      break;
     }
    } else {
     $$sum29 = $$sum2 + 8 | 0;
     $48 = $mem + $$sum29 | 0;
     $49 = HEAP32[$48 >> 2] | 0;
     $50 = $49 >>> 0 < $2 >>> 0;
     if ($50) {
      _abort();
     }
     $51 = $49 + 12 | 0;
     $52 = HEAP32[$51 >> 2] | 0;
     $53 = ($52 | 0) == ($14 | 0);
     if (!$53) {
      _abort();
     }
     $54 = $46 + 8 | 0;
     $55 = HEAP32[$54 >> 2] | 0;
     $56 = ($55 | 0) == ($14 | 0);
     if ($56) {
      HEAP32[$51 >> 2] = $46;
      HEAP32[$54 >> 2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   $70 = ($44 | 0) == (0 | 0);
   if ($70) {
    $p$0 = $14;
    $psize$0 = $15;
   } else {
    $$sum26 = $$sum2 + 28 | 0;
    $71 = $mem + $$sum26 | 0;
    $72 = HEAP32[$71 >> 2] | 0;
    $73 = 680 + ($72 << 2) | 0;
    $74 = HEAP32[$73 >> 2] | 0;
    $75 = ($14 | 0) == ($74 | 0);
    if ($75) {
     HEAP32[$73 >> 2] = $R$1;
     $cond = ($R$1 | 0) == (0 | 0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[380 >> 2] | 0;
      $79 = $78 & $77;
      HEAP32[380 >> 2] = $79;
      $p$0 = $14;
      $psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[392 >> 2] | 0;
     $81 = $44 >>> 0 < $80 >>> 0;
     if ($81) {
      _abort();
     }
     $82 = $44 + 16 | 0;
     $83 = HEAP32[$82 >> 2] | 0;
     $84 = ($83 | 0) == ($14 | 0);
     if ($84) {
      HEAP32[$82 >> 2] = $R$1;
     } else {
      $85 = $44 + 20 | 0;
      HEAP32[$85 >> 2] = $R$1;
     }
     $86 = ($R$1 | 0) == (0 | 0);
     if ($86) {
      $p$0 = $14;
      $psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[392 >> 2] | 0;
    $88 = $R$1 >>> 0 < $87 >>> 0;
    if ($88) {
     _abort();
    }
    $89 = $R$1 + 24 | 0;
    HEAP32[$89 >> 2] = $44;
    $$sum27 = $$sum2 + 16 | 0;
    $90 = $mem + $$sum27 | 0;
    $91 = HEAP32[$90 >> 2] | 0;
    $92 = ($91 | 0) == (0 | 0);
    do {
     if (!$92) {
      $93 = $91 >>> 0 < $87 >>> 0;
      if ($93) {
       _abort();
      } else {
       $94 = $R$1 + 16 | 0;
       HEAP32[$94 >> 2] = $91;
       $95 = $91 + 24 | 0;
       HEAP32[$95 >> 2] = $R$1;
       break;
      }
     }
    } while (0);
    $$sum28 = $$sum2 + 20 | 0;
    $96 = $mem + $$sum28 | 0;
    $97 = HEAP32[$96 >> 2] | 0;
    $98 = ($97 | 0) == (0 | 0);
    if ($98) {
     $p$0 = $14;
     $psize$0 = $15;
    } else {
     $99 = HEAP32[392 >> 2] | 0;
     $100 = $97 >>> 0 < $99 >>> 0;
     if ($100) {
      _abort();
     } else {
      $101 = $R$1 + 20 | 0;
      HEAP32[$101 >> 2] = $97;
      $102 = $97 + 24 | 0;
      HEAP32[$102 >> 2] = $R$1;
      $p$0 = $14;
      $psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;
   $psize$0 = $8;
  }
 } while (0);
 $110 = $p$0 >>> 0 < $9 >>> 0;
 if (!$110) {
  _abort();
 }
 $$sum19 = $8 + -4 | 0;
 $111 = $mem + $$sum19 | 0;
 $112 = HEAP32[$111 >> 2] | 0;
 $113 = $112 & 1;
 $114 = ($113 | 0) == 0;
 if ($114) {
  _abort();
 }
 $115 = $112 & 2;
 $116 = ($115 | 0) == 0;
 if ($116) {
  $117 = HEAP32[400 >> 2] | 0;
  $118 = ($9 | 0) == ($117 | 0);
  if ($118) {
   $119 = HEAP32[388 >> 2] | 0;
   $120 = $119 + $psize$0 | 0;
   HEAP32[388 >> 2] = $120;
   HEAP32[400 >> 2] = $p$0;
   $121 = $120 | 1;
   $122 = $p$0 + 4 | 0;
   HEAP32[$122 >> 2] = $121;
   $123 = HEAP32[396 >> 2] | 0;
   $124 = ($p$0 | 0) == ($123 | 0);
   if (!$124) {
    return;
   }
   HEAP32[396 >> 2] = 0;
   HEAP32[384 >> 2] = 0;
   return;
  }
  $125 = HEAP32[396 >> 2] | 0;
  $126 = ($9 | 0) == ($125 | 0);
  if ($126) {
   $127 = HEAP32[384 >> 2] | 0;
   $128 = $127 + $psize$0 | 0;
   HEAP32[384 >> 2] = $128;
   HEAP32[396 >> 2] = $p$0;
   $129 = $128 | 1;
   $130 = $p$0 + 4 | 0;
   HEAP32[$130 >> 2] = $129;
   $131 = $p$0 + $128 | 0;
   HEAP32[$131 >> 2] = $128;
   return;
  }
  $132 = $112 & -8;
  $133 = $132 + $psize$0 | 0;
  $134 = $112 >>> 3;
  $135 = $112 >>> 0 < 256;
  do {
   if ($135) {
    $136 = $mem + $8 | 0;
    $137 = HEAP32[$136 >> 2] | 0;
    $$sum1718 = $8 | 4;
    $138 = $mem + $$sum1718 | 0;
    $139 = HEAP32[$138 >> 2] | 0;
    $140 = $134 << 1;
    $141 = 416 + ($140 << 2) | 0;
    $142 = ($137 | 0) == ($141 | 0);
    if (!$142) {
     $143 = HEAP32[392 >> 2] | 0;
     $144 = $137 >>> 0 < $143 >>> 0;
     if ($144) {
      _abort();
     }
     $145 = $137 + 12 | 0;
     $146 = HEAP32[$145 >> 2] | 0;
     $147 = ($146 | 0) == ($9 | 0);
     if (!$147) {
      _abort();
     }
    }
    $148 = ($139 | 0) == ($137 | 0);
    if ($148) {
     $149 = 1 << $134;
     $150 = $149 ^ -1;
     $151 = HEAP32[376 >> 2] | 0;
     $152 = $151 & $150;
     HEAP32[376 >> 2] = $152;
     break;
    }
    $153 = ($139 | 0) == ($141 | 0);
    if ($153) {
     $$pre58 = $139 + 8 | 0;
     $$pre$phi59Z2D = $$pre58;
    } else {
     $154 = HEAP32[392 >> 2] | 0;
     $155 = $139 >>> 0 < $154 >>> 0;
     if ($155) {
      _abort();
     }
     $156 = $139 + 8 | 0;
     $157 = HEAP32[$156 >> 2] | 0;
     $158 = ($157 | 0) == ($9 | 0);
     if ($158) {
      $$pre$phi59Z2D = $156;
     } else {
      _abort();
     }
    }
    $159 = $137 + 12 | 0;
    HEAP32[$159 >> 2] = $139;
    HEAP32[$$pre$phi59Z2D >> 2] = $137;
   } else {
    $$sum5 = $8 + 16 | 0;
    $160 = $mem + $$sum5 | 0;
    $161 = HEAP32[$160 >> 2] | 0;
    $$sum67 = $8 | 4;
    $162 = $mem + $$sum67 | 0;
    $163 = HEAP32[$162 >> 2] | 0;
    $164 = ($163 | 0) == ($9 | 0);
    do {
     if ($164) {
      $$sum9 = $8 + 12 | 0;
      $175 = $mem + $$sum9 | 0;
      $176 = HEAP32[$175 >> 2] | 0;
      $177 = ($176 | 0) == (0 | 0);
      if ($177) {
       $$sum8 = $8 + 8 | 0;
       $178 = $mem + $$sum8 | 0;
       $179 = HEAP32[$178 >> 2] | 0;
       $180 = ($179 | 0) == (0 | 0);
       if ($180) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $179;
        $RP9$0 = $178;
       }
      } else {
       $R7$0 = $176;
       $RP9$0 = $175;
      }
      while (1) {
       $181 = $R7$0 + 20 | 0;
       $182 = HEAP32[$181 >> 2] | 0;
       $183 = ($182 | 0) == (0 | 0);
       if (!$183) {
        $R7$0 = $182;
        $RP9$0 = $181;
        continue;
       }
       $184 = $R7$0 + 16 | 0;
       $185 = HEAP32[$184 >> 2] | 0;
       $186 = ($185 | 0) == (0 | 0);
       if ($186) {
        $R7$0$lcssa = $R7$0;
        $RP9$0$lcssa = $RP9$0;
        break;
       } else {
        $R7$0 = $185;
        $RP9$0 = $184;
       }
      }
      $187 = HEAP32[392 >> 2] | 0;
      $188 = $RP9$0$lcssa >>> 0 < $187 >>> 0;
      if ($188) {
       _abort();
      } else {
       HEAP32[$RP9$0$lcssa >> 2] = 0;
       $R7$1 = $R7$0$lcssa;
       break;
      }
     } else {
      $165 = $mem + $8 | 0;
      $166 = HEAP32[$165 >> 2] | 0;
      $167 = HEAP32[392 >> 2] | 0;
      $168 = $166 >>> 0 < $167 >>> 0;
      if ($168) {
       _abort();
      }
      $169 = $166 + 12 | 0;
      $170 = HEAP32[$169 >> 2] | 0;
      $171 = ($170 | 0) == ($9 | 0);
      if (!$171) {
       _abort();
      }
      $172 = $163 + 8 | 0;
      $173 = HEAP32[$172 >> 2] | 0;
      $174 = ($173 | 0) == ($9 | 0);
      if ($174) {
       HEAP32[$169 >> 2] = $163;
       HEAP32[$172 >> 2] = $166;
       $R7$1 = $163;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    $189 = ($161 | 0) == (0 | 0);
    if (!$189) {
     $$sum12 = $8 + 20 | 0;
     $190 = $mem + $$sum12 | 0;
     $191 = HEAP32[$190 >> 2] | 0;
     $192 = 680 + ($191 << 2) | 0;
     $193 = HEAP32[$192 >> 2] | 0;
     $194 = ($9 | 0) == ($193 | 0);
     if ($194) {
      HEAP32[$192 >> 2] = $R7$1;
      $cond47 = ($R7$1 | 0) == (0 | 0);
      if ($cond47) {
       $195 = 1 << $191;
       $196 = $195 ^ -1;
       $197 = HEAP32[380 >> 2] | 0;
       $198 = $197 & $196;
       HEAP32[380 >> 2] = $198;
       break;
      }
     } else {
      $199 = HEAP32[392 >> 2] | 0;
      $200 = $161 >>> 0 < $199 >>> 0;
      if ($200) {
       _abort();
      }
      $201 = $161 + 16 | 0;
      $202 = HEAP32[$201 >> 2] | 0;
      $203 = ($202 | 0) == ($9 | 0);
      if ($203) {
       HEAP32[$201 >> 2] = $R7$1;
      } else {
       $204 = $161 + 20 | 0;
       HEAP32[$204 >> 2] = $R7$1;
      }
      $205 = ($R7$1 | 0) == (0 | 0);
      if ($205) {
       break;
      }
     }
     $206 = HEAP32[392 >> 2] | 0;
     $207 = $R7$1 >>> 0 < $206 >>> 0;
     if ($207) {
      _abort();
     }
     $208 = $R7$1 + 24 | 0;
     HEAP32[$208 >> 2] = $161;
     $$sum13 = $8 + 8 | 0;
     $209 = $mem + $$sum13 | 0;
     $210 = HEAP32[$209 >> 2] | 0;
     $211 = ($210 | 0) == (0 | 0);
     do {
      if (!$211) {
       $212 = $210 >>> 0 < $206 >>> 0;
       if ($212) {
        _abort();
       } else {
        $213 = $R7$1 + 16 | 0;
        HEAP32[$213 >> 2] = $210;
        $214 = $210 + 24 | 0;
        HEAP32[$214 >> 2] = $R7$1;
        break;
       }
      }
     } while (0);
     $$sum14 = $8 + 12 | 0;
     $215 = $mem + $$sum14 | 0;
     $216 = HEAP32[$215 >> 2] | 0;
     $217 = ($216 | 0) == (0 | 0);
     if (!$217) {
      $218 = HEAP32[392 >> 2] | 0;
      $219 = $216 >>> 0 < $218 >>> 0;
      if ($219) {
       _abort();
      } else {
       $220 = $R7$1 + 20 | 0;
       HEAP32[$220 >> 2] = $216;
       $221 = $216 + 24 | 0;
       HEAP32[$221 >> 2] = $R7$1;
       break;
      }
     }
    }
   }
  } while (0);
  $222 = $133 | 1;
  $223 = $p$0 + 4 | 0;
  HEAP32[$223 >> 2] = $222;
  $224 = $p$0 + $133 | 0;
  HEAP32[$224 >> 2] = $133;
  $225 = HEAP32[396 >> 2] | 0;
  $226 = ($p$0 | 0) == ($225 | 0);
  if ($226) {
   HEAP32[384 >> 2] = $133;
   return;
  } else {
   $psize$1 = $133;
  }
 } else {
  $227 = $112 & -2;
  HEAP32[$111 >> 2] = $227;
  $228 = $psize$0 | 1;
  $229 = $p$0 + 4 | 0;
  HEAP32[$229 >> 2] = $228;
  $230 = $p$0 + $psize$0 | 0;
  HEAP32[$230 >> 2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $231 = $psize$1 >>> 3;
 $232 = $psize$1 >>> 0 < 256;
 if ($232) {
  $233 = $231 << 1;
  $234 = 416 + ($233 << 2) | 0;
  $235 = HEAP32[376 >> 2] | 0;
  $236 = 1 << $231;
  $237 = $235 & $236;
  $238 = ($237 | 0) == 0;
  if ($238) {
   $239 = $235 | $236;
   HEAP32[376 >> 2] = $239;
   $$pre = $233 + 2 | 0;
   $$pre57 = 416 + ($$pre << 2) | 0;
   $$pre$phiZ2D = $$pre57;
   $F16$0 = $234;
  } else {
   $$sum11 = $233 + 2 | 0;
   $240 = 416 + ($$sum11 << 2) | 0;
   $241 = HEAP32[$240 >> 2] | 0;
   $242 = HEAP32[392 >> 2] | 0;
   $243 = $241 >>> 0 < $242 >>> 0;
   if ($243) {
    _abort();
   } else {
    $$pre$phiZ2D = $240;
    $F16$0 = $241;
   }
  }
  HEAP32[$$pre$phiZ2D >> 2] = $p$0;
  $244 = $F16$0 + 12 | 0;
  HEAP32[$244 >> 2] = $p$0;
  $245 = $p$0 + 8 | 0;
  HEAP32[$245 >> 2] = $F16$0;
  $246 = $p$0 + 12 | 0;
  HEAP32[$246 >> 2] = $234;
  return;
 }
 $247 = $psize$1 >>> 8;
 $248 = ($247 | 0) == 0;
 if ($248) {
  $I18$0 = 0;
 } else {
  $249 = $psize$1 >>> 0 > 16777215;
  if ($249) {
   $I18$0 = 31;
  } else {
   $250 = $247 + 1048320 | 0;
   $251 = $250 >>> 16;
   $252 = $251 & 8;
   $253 = $247 << $252;
   $254 = $253 + 520192 | 0;
   $255 = $254 >>> 16;
   $256 = $255 & 4;
   $257 = $256 | $252;
   $258 = $253 << $256;
   $259 = $258 + 245760 | 0;
   $260 = $259 >>> 16;
   $261 = $260 & 2;
   $262 = $257 | $261;
   $263 = 14 - $262 | 0;
   $264 = $258 << $261;
   $265 = $264 >>> 15;
   $266 = $263 + $265 | 0;
   $267 = $266 << 1;
   $268 = $266 + 7 | 0;
   $269 = $psize$1 >>> $268;
   $270 = $269 & 1;
   $271 = $270 | $267;
   $I18$0 = $271;
  }
 }
 $272 = 680 + ($I18$0 << 2) | 0;
 $273 = $p$0 + 28 | 0;
 HEAP32[$273 >> 2] = $I18$0;
 $274 = $p$0 + 16 | 0;
 $275 = $p$0 + 20 | 0;
 HEAP32[$275 >> 2] = 0;
 HEAP32[$274 >> 2] = 0;
 $276 = HEAP32[380 >> 2] | 0;
 $277 = 1 << $I18$0;
 $278 = $276 & $277;
 $279 = ($278 | 0) == 0;
 L199 : do {
  if ($279) {
   $280 = $276 | $277;
   HEAP32[380 >> 2] = $280;
   HEAP32[$272 >> 2] = $p$0;
   $281 = $p$0 + 24 | 0;
   HEAP32[$281 >> 2] = $272;
   $282 = $p$0 + 12 | 0;
   HEAP32[$282 >> 2] = $p$0;
   $283 = $p$0 + 8 | 0;
   HEAP32[$283 >> 2] = $p$0;
  } else {
   $284 = HEAP32[$272 >> 2] | 0;
   $285 = $284 + 4 | 0;
   $286 = HEAP32[$285 >> 2] | 0;
   $287 = $286 & -8;
   $288 = ($287 | 0) == ($psize$1 | 0);
   L202 : do {
    if ($288) {
     $T$0$lcssa = $284;
    } else {
     $289 = ($I18$0 | 0) == 31;
     $290 = $I18$0 >>> 1;
     $291 = 25 - $290 | 0;
     $292 = $289 ? 0 : $291;
     $293 = $psize$1 << $292;
     $K19$052 = $293;
     $T$051 = $284;
     while (1) {
      $300 = $K19$052 >>> 31;
      $301 = ($T$051 + 16 | 0) + ($300 << 2) | 0;
      $296 = HEAP32[$301 >> 2] | 0;
      $302 = ($296 | 0) == (0 | 0);
      if ($302) {
       $$lcssa = $301;
       $T$051$lcssa = $T$051;
       break;
      }
      $294 = $K19$052 << 1;
      $295 = $296 + 4 | 0;
      $297 = HEAP32[$295 >> 2] | 0;
      $298 = $297 & -8;
      $299 = ($298 | 0) == ($psize$1 | 0);
      if ($299) {
       $T$0$lcssa = $296;
       break L202;
      } else {
       $K19$052 = $294;
       $T$051 = $296;
      }
     }
     $303 = HEAP32[392 >> 2] | 0;
     $304 = $$lcssa >>> 0 < $303 >>> 0;
     if ($304) {
      _abort();
     } else {
      HEAP32[$$lcssa >> 2] = $p$0;
      $305 = $p$0 + 24 | 0;
      HEAP32[$305 >> 2] = $T$051$lcssa;
      $306 = $p$0 + 12 | 0;
      HEAP32[$306 >> 2] = $p$0;
      $307 = $p$0 + 8 | 0;
      HEAP32[$307 >> 2] = $p$0;
      break L199;
     }
    }
   } while (0);
   $308 = $T$0$lcssa + 8 | 0;
   $309 = HEAP32[$308 >> 2] | 0;
   $310 = HEAP32[392 >> 2] | 0;
   $311 = $309 >>> 0 >= $310 >>> 0;
   $not$ = $T$0$lcssa >>> 0 >= $310 >>> 0;
   $312 = $311 & $not$;
   if ($312) {
    $313 = $309 + 12 | 0;
    HEAP32[$313 >> 2] = $p$0;
    HEAP32[$308 >> 2] = $p$0;
    $314 = $p$0 + 8 | 0;
    HEAP32[$314 >> 2] = $309;
    $315 = $p$0 + 12 | 0;
    HEAP32[$315 >> 2] = $T$0$lcssa;
    $316 = $p$0 + 24 | 0;
    HEAP32[$316 >> 2] = 0;
    break;
   } else {
    _abort();
   }
  }
 } while (0);
 $317 = HEAP32[408 >> 2] | 0;
 $318 = $317 + -1 | 0;
 HEAP32[408 >> 2] = $318;
 $319 = ($318 | 0) == 0;
 if ($319) {
  $sp$0$in$i = 832;
 } else {
  return;
 }
 while (1) {
  $sp$0$i = HEAP32[$sp$0$in$i >> 2] | 0;
  $320 = ($sp$0$i | 0) == (0 | 0);
  $321 = $sp$0$i + 8 | 0;
  if ($320) {
   break;
  } else {
   $sp$0$in$i = $321;
  }
 }
 HEAP32[408 >> 2] = -1;
 return;
}

function _dispose_chunk($p, $psize) {
 $p = $p | 0;
 $psize = $psize | 0;
 var $$0 = 0, $$02 = 0, $$1 = 0, $$lcssa = 0, $$pre = 0, $$pre$phi50Z2D = 0, $$pre$phi52Z2D = 0, $$pre$phiZ2D = 0, $$pre48 = 0, $$pre49 = 0, $$pre51 = 0, $$sum = 0, $$sum1 = 0, $$sum10 = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum16 = 0, $$sum17 = 0;
 var $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum21 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0, $$sum25 = 0, $$sum3 = 0, $$sum4 = 0, $$sum5 = 0, $$sum7 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0;
 var $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0;
 var $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0;
 var $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I19$0 = 0, $K20$043 = 0, $R$0 = 0, $R$0$lcssa = 0, $R$1 = 0, $R7$0 = 0, $R7$0$lcssa = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$lcssa = 0, $RP9$0 = 0, $RP9$0$lcssa = 0, $T$0$lcssa = 0, $T$042 = 0, $T$042$lcssa = 0, $cond = 0;
 var $cond39 = 0, $not$ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $p + $psize | 0;
 $1 = $p + 4 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $2 & 1;
 $4 = ($3 | 0) == 0;
 do {
  if ($4) {
   $5 = HEAP32[$p >> 2] | 0;
   $6 = $2 & 3;
   $7 = ($6 | 0) == 0;
   if ($7) {
    return;
   }
   $8 = 0 - $5 | 0;
   $9 = $p + $8 | 0;
   $10 = $5 + $psize | 0;
   $11 = HEAP32[392 >> 2] | 0;
   $12 = $9 >>> 0 < $11 >>> 0;
   if ($12) {
    _abort();
   }
   $13 = HEAP32[396 >> 2] | 0;
   $14 = ($9 | 0) == ($13 | 0);
   if ($14) {
    $$sum = $psize + 4 | 0;
    $99 = $p + $$sum | 0;
    $100 = HEAP32[$99 >> 2] | 0;
    $101 = $100 & 3;
    $102 = ($101 | 0) == 3;
    if (!$102) {
     $$0 = $9;
     $$02 = $10;
     break;
    }
    HEAP32[384 >> 2] = $10;
    $103 = $100 & -2;
    HEAP32[$99 >> 2] = $103;
    $104 = $10 | 1;
    $$sum14 = 4 - $5 | 0;
    $105 = $p + $$sum14 | 0;
    HEAP32[$105 >> 2] = $104;
    HEAP32[$0 >> 2] = $10;
    return;
   }
   $15 = $5 >>> 3;
   $16 = $5 >>> 0 < 256;
   if ($16) {
    $$sum24 = 8 - $5 | 0;
    $17 = $p + $$sum24 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $$sum25 = 12 - $5 | 0;
    $19 = $p + $$sum25 | 0;
    $20 = HEAP32[$19 >> 2] | 0;
    $21 = $15 << 1;
    $22 = 416 + ($21 << 2) | 0;
    $23 = ($18 | 0) == ($22 | 0);
    if (!$23) {
     $24 = $18 >>> 0 < $11 >>> 0;
     if ($24) {
      _abort();
     }
     $25 = $18 + 12 | 0;
     $26 = HEAP32[$25 >> 2] | 0;
     $27 = ($26 | 0) == ($9 | 0);
     if (!$27) {
      _abort();
     }
    }
    $28 = ($20 | 0) == ($18 | 0);
    if ($28) {
     $29 = 1 << $15;
     $30 = $29 ^ -1;
     $31 = HEAP32[376 >> 2] | 0;
     $32 = $31 & $30;
     HEAP32[376 >> 2] = $32;
     $$0 = $9;
     $$02 = $10;
     break;
    }
    $33 = ($20 | 0) == ($22 | 0);
    if ($33) {
     $$pre51 = $20 + 8 | 0;
     $$pre$phi52Z2D = $$pre51;
    } else {
     $34 = $20 >>> 0 < $11 >>> 0;
     if ($34) {
      _abort();
     }
     $35 = $20 + 8 | 0;
     $36 = HEAP32[$35 >> 2] | 0;
     $37 = ($36 | 0) == ($9 | 0);
     if ($37) {
      $$pre$phi52Z2D = $35;
     } else {
      _abort();
     }
    }
    $38 = $18 + 12 | 0;
    HEAP32[$38 >> 2] = $20;
    HEAP32[$$pre$phi52Z2D >> 2] = $18;
    $$0 = $9;
    $$02 = $10;
    break;
   }
   $$sum16 = 24 - $5 | 0;
   $39 = $p + $$sum16 | 0;
   $40 = HEAP32[$39 >> 2] | 0;
   $$sum17 = 12 - $5 | 0;
   $41 = $p + $$sum17 | 0;
   $42 = HEAP32[$41 >> 2] | 0;
   $43 = ($42 | 0) == ($9 | 0);
   do {
    if ($43) {
     $$sum18 = 16 - $5 | 0;
     $$sum19 = $$sum18 + 4 | 0;
     $53 = $p + $$sum19 | 0;
     $54 = HEAP32[$53 >> 2] | 0;
     $55 = ($54 | 0) == (0 | 0);
     if ($55) {
      $56 = $p + $$sum18 | 0;
      $57 = HEAP32[$56 >> 2] | 0;
      $58 = ($57 | 0) == (0 | 0);
      if ($58) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $57;
       $RP$0 = $56;
      }
     } else {
      $R$0 = $54;
      $RP$0 = $53;
     }
     while (1) {
      $59 = $R$0 + 20 | 0;
      $60 = HEAP32[$59 >> 2] | 0;
      $61 = ($60 | 0) == (0 | 0);
      if (!$61) {
       $R$0 = $60;
       $RP$0 = $59;
       continue;
      }
      $62 = $R$0 + 16 | 0;
      $63 = HEAP32[$62 >> 2] | 0;
      $64 = ($63 | 0) == (0 | 0);
      if ($64) {
       $R$0$lcssa = $R$0;
       $RP$0$lcssa = $RP$0;
       break;
      } else {
       $R$0 = $63;
       $RP$0 = $62;
      }
     }
     $65 = $RP$0$lcssa >>> 0 < $11 >>> 0;
     if ($65) {
      _abort();
     } else {
      HEAP32[$RP$0$lcssa >> 2] = 0;
      $R$1 = $R$0$lcssa;
      break;
     }
    } else {
     $$sum23 = 8 - $5 | 0;
     $44 = $p + $$sum23 | 0;
     $45 = HEAP32[$44 >> 2] | 0;
     $46 = $45 >>> 0 < $11 >>> 0;
     if ($46) {
      _abort();
     }
     $47 = $45 + 12 | 0;
     $48 = HEAP32[$47 >> 2] | 0;
     $49 = ($48 | 0) == ($9 | 0);
     if (!$49) {
      _abort();
     }
     $50 = $42 + 8 | 0;
     $51 = HEAP32[$50 >> 2] | 0;
     $52 = ($51 | 0) == ($9 | 0);
     if ($52) {
      HEAP32[$47 >> 2] = $42;
      HEAP32[$50 >> 2] = $45;
      $R$1 = $42;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   $66 = ($40 | 0) == (0 | 0);
   if ($66) {
    $$0 = $9;
    $$02 = $10;
   } else {
    $$sum20 = 28 - $5 | 0;
    $67 = $p + $$sum20 | 0;
    $68 = HEAP32[$67 >> 2] | 0;
    $69 = 680 + ($68 << 2) | 0;
    $70 = HEAP32[$69 >> 2] | 0;
    $71 = ($9 | 0) == ($70 | 0);
    if ($71) {
     HEAP32[$69 >> 2] = $R$1;
     $cond = ($R$1 | 0) == (0 | 0);
     if ($cond) {
      $72 = 1 << $68;
      $73 = $72 ^ -1;
      $74 = HEAP32[380 >> 2] | 0;
      $75 = $74 & $73;
      HEAP32[380 >> 2] = $75;
      $$0 = $9;
      $$02 = $10;
      break;
     }
    } else {
     $76 = HEAP32[392 >> 2] | 0;
     $77 = $40 >>> 0 < $76 >>> 0;
     if ($77) {
      _abort();
     }
     $78 = $40 + 16 | 0;
     $79 = HEAP32[$78 >> 2] | 0;
     $80 = ($79 | 0) == ($9 | 0);
     if ($80) {
      HEAP32[$78 >> 2] = $R$1;
     } else {
      $81 = $40 + 20 | 0;
      HEAP32[$81 >> 2] = $R$1;
     }
     $82 = ($R$1 | 0) == (0 | 0);
     if ($82) {
      $$0 = $9;
      $$02 = $10;
      break;
     }
    }
    $83 = HEAP32[392 >> 2] | 0;
    $84 = $R$1 >>> 0 < $83 >>> 0;
    if ($84) {
     _abort();
    }
    $85 = $R$1 + 24 | 0;
    HEAP32[$85 >> 2] = $40;
    $$sum21 = 16 - $5 | 0;
    $86 = $p + $$sum21 | 0;
    $87 = HEAP32[$86 >> 2] | 0;
    $88 = ($87 | 0) == (0 | 0);
    do {
     if (!$88) {
      $89 = $87 >>> 0 < $83 >>> 0;
      if ($89) {
       _abort();
      } else {
       $90 = $R$1 + 16 | 0;
       HEAP32[$90 >> 2] = $87;
       $91 = $87 + 24 | 0;
       HEAP32[$91 >> 2] = $R$1;
       break;
      }
     }
    } while (0);
    $$sum22 = $$sum21 + 4 | 0;
    $92 = $p + $$sum22 | 0;
    $93 = HEAP32[$92 >> 2] | 0;
    $94 = ($93 | 0) == (0 | 0);
    if ($94) {
     $$0 = $9;
     $$02 = $10;
    } else {
     $95 = HEAP32[392 >> 2] | 0;
     $96 = $93 >>> 0 < $95 >>> 0;
     if ($96) {
      _abort();
     } else {
      $97 = $R$1 + 20 | 0;
      HEAP32[$97 >> 2] = $93;
      $98 = $93 + 24 | 0;
      HEAP32[$98 >> 2] = $R$1;
      $$0 = $9;
      $$02 = $10;
      break;
     }
    }
   }
  } else {
   $$0 = $p;
   $$02 = $psize;
  }
 } while (0);
 $106 = HEAP32[392 >> 2] | 0;
 $107 = $0 >>> 0 < $106 >>> 0;
 if ($107) {
  _abort();
 }
 $$sum1 = $psize + 4 | 0;
 $108 = $p + $$sum1 | 0;
 $109 = HEAP32[$108 >> 2] | 0;
 $110 = $109 & 2;
 $111 = ($110 | 0) == 0;
 if ($111) {
  $112 = HEAP32[400 >> 2] | 0;
  $113 = ($0 | 0) == ($112 | 0);
  if ($113) {
   $114 = HEAP32[388 >> 2] | 0;
   $115 = $114 + $$02 | 0;
   HEAP32[388 >> 2] = $115;
   HEAP32[400 >> 2] = $$0;
   $116 = $115 | 1;
   $117 = $$0 + 4 | 0;
   HEAP32[$117 >> 2] = $116;
   $118 = HEAP32[396 >> 2] | 0;
   $119 = ($$0 | 0) == ($118 | 0);
   if (!$119) {
    return;
   }
   HEAP32[396 >> 2] = 0;
   HEAP32[384 >> 2] = 0;
   return;
  }
  $120 = HEAP32[396 >> 2] | 0;
  $121 = ($0 | 0) == ($120 | 0);
  if ($121) {
   $122 = HEAP32[384 >> 2] | 0;
   $123 = $122 + $$02 | 0;
   HEAP32[384 >> 2] = $123;
   HEAP32[396 >> 2] = $$0;
   $124 = $123 | 1;
   $125 = $$0 + 4 | 0;
   HEAP32[$125 >> 2] = $124;
   $126 = $$0 + $123 | 0;
   HEAP32[$126 >> 2] = $123;
   return;
  }
  $127 = $109 & -8;
  $128 = $127 + $$02 | 0;
  $129 = $109 >>> 3;
  $130 = $109 >>> 0 < 256;
  do {
   if ($130) {
    $$sum12 = $psize + 8 | 0;
    $131 = $p + $$sum12 | 0;
    $132 = HEAP32[$131 >> 2] | 0;
    $$sum13 = $psize + 12 | 0;
    $133 = $p + $$sum13 | 0;
    $134 = HEAP32[$133 >> 2] | 0;
    $135 = $129 << 1;
    $136 = 416 + ($135 << 2) | 0;
    $137 = ($132 | 0) == ($136 | 0);
    if (!$137) {
     $138 = $132 >>> 0 < $106 >>> 0;
     if ($138) {
      _abort();
     }
     $139 = $132 + 12 | 0;
     $140 = HEAP32[$139 >> 2] | 0;
     $141 = ($140 | 0) == ($0 | 0);
     if (!$141) {
      _abort();
     }
    }
    $142 = ($134 | 0) == ($132 | 0);
    if ($142) {
     $143 = 1 << $129;
     $144 = $143 ^ -1;
     $145 = HEAP32[376 >> 2] | 0;
     $146 = $145 & $144;
     HEAP32[376 >> 2] = $146;
     break;
    }
    $147 = ($134 | 0) == ($136 | 0);
    if ($147) {
     $$pre49 = $134 + 8 | 0;
     $$pre$phi50Z2D = $$pre49;
    } else {
     $148 = $134 >>> 0 < $106 >>> 0;
     if ($148) {
      _abort();
     }
     $149 = $134 + 8 | 0;
     $150 = HEAP32[$149 >> 2] | 0;
     $151 = ($150 | 0) == ($0 | 0);
     if ($151) {
      $$pre$phi50Z2D = $149;
     } else {
      _abort();
     }
    }
    $152 = $132 + 12 | 0;
    HEAP32[$152 >> 2] = $134;
    HEAP32[$$pre$phi50Z2D >> 2] = $132;
   } else {
    $$sum2 = $psize + 24 | 0;
    $153 = $p + $$sum2 | 0;
    $154 = HEAP32[$153 >> 2] | 0;
    $$sum3 = $psize + 12 | 0;
    $155 = $p + $$sum3 | 0;
    $156 = HEAP32[$155 >> 2] | 0;
    $157 = ($156 | 0) == ($0 | 0);
    do {
     if ($157) {
      $$sum5 = $psize + 20 | 0;
      $167 = $p + $$sum5 | 0;
      $168 = HEAP32[$167 >> 2] | 0;
      $169 = ($168 | 0) == (0 | 0);
      if ($169) {
       $$sum4 = $psize + 16 | 0;
       $170 = $p + $$sum4 | 0;
       $171 = HEAP32[$170 >> 2] | 0;
       $172 = ($171 | 0) == (0 | 0);
       if ($172) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $171;
        $RP9$0 = $170;
       }
      } else {
       $R7$0 = $168;
       $RP9$0 = $167;
      }
      while (1) {
       $173 = $R7$0 + 20 | 0;
       $174 = HEAP32[$173 >> 2] | 0;
       $175 = ($174 | 0) == (0 | 0);
       if (!$175) {
        $R7$0 = $174;
        $RP9$0 = $173;
        continue;
       }
       $176 = $R7$0 + 16 | 0;
       $177 = HEAP32[$176 >> 2] | 0;
       $178 = ($177 | 0) == (0 | 0);
       if ($178) {
        $R7$0$lcssa = $R7$0;
        $RP9$0$lcssa = $RP9$0;
        break;
       } else {
        $R7$0 = $177;
        $RP9$0 = $176;
       }
      }
      $179 = $RP9$0$lcssa >>> 0 < $106 >>> 0;
      if ($179) {
       _abort();
      } else {
       HEAP32[$RP9$0$lcssa >> 2] = 0;
       $R7$1 = $R7$0$lcssa;
       break;
      }
     } else {
      $$sum11 = $psize + 8 | 0;
      $158 = $p + $$sum11 | 0;
      $159 = HEAP32[$158 >> 2] | 0;
      $160 = $159 >>> 0 < $106 >>> 0;
      if ($160) {
       _abort();
      }
      $161 = $159 + 12 | 0;
      $162 = HEAP32[$161 >> 2] | 0;
      $163 = ($162 | 0) == ($0 | 0);
      if (!$163) {
       _abort();
      }
      $164 = $156 + 8 | 0;
      $165 = HEAP32[$164 >> 2] | 0;
      $166 = ($165 | 0) == ($0 | 0);
      if ($166) {
       HEAP32[$161 >> 2] = $156;
       HEAP32[$164 >> 2] = $159;
       $R7$1 = $156;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    $180 = ($154 | 0) == (0 | 0);
    if (!$180) {
     $$sum8 = $psize + 28 | 0;
     $181 = $p + $$sum8 | 0;
     $182 = HEAP32[$181 >> 2] | 0;
     $183 = 680 + ($182 << 2) | 0;
     $184 = HEAP32[$183 >> 2] | 0;
     $185 = ($0 | 0) == ($184 | 0);
     if ($185) {
      HEAP32[$183 >> 2] = $R7$1;
      $cond39 = ($R7$1 | 0) == (0 | 0);
      if ($cond39) {
       $186 = 1 << $182;
       $187 = $186 ^ -1;
       $188 = HEAP32[380 >> 2] | 0;
       $189 = $188 & $187;
       HEAP32[380 >> 2] = $189;
       break;
      }
     } else {
      $190 = HEAP32[392 >> 2] | 0;
      $191 = $154 >>> 0 < $190 >>> 0;
      if ($191) {
       _abort();
      }
      $192 = $154 + 16 | 0;
      $193 = HEAP32[$192 >> 2] | 0;
      $194 = ($193 | 0) == ($0 | 0);
      if ($194) {
       HEAP32[$192 >> 2] = $R7$1;
      } else {
       $195 = $154 + 20 | 0;
       HEAP32[$195 >> 2] = $R7$1;
      }
      $196 = ($R7$1 | 0) == (0 | 0);
      if ($196) {
       break;
      }
     }
     $197 = HEAP32[392 >> 2] | 0;
     $198 = $R7$1 >>> 0 < $197 >>> 0;
     if ($198) {
      _abort();
     }
     $199 = $R7$1 + 24 | 0;
     HEAP32[$199 >> 2] = $154;
     $$sum9 = $psize + 16 | 0;
     $200 = $p + $$sum9 | 0;
     $201 = HEAP32[$200 >> 2] | 0;
     $202 = ($201 | 0) == (0 | 0);
     do {
      if (!$202) {
       $203 = $201 >>> 0 < $197 >>> 0;
       if ($203) {
        _abort();
       } else {
        $204 = $R7$1 + 16 | 0;
        HEAP32[$204 >> 2] = $201;
        $205 = $201 + 24 | 0;
        HEAP32[$205 >> 2] = $R7$1;
        break;
       }
      }
     } while (0);
     $$sum10 = $psize + 20 | 0;
     $206 = $p + $$sum10 | 0;
     $207 = HEAP32[$206 >> 2] | 0;
     $208 = ($207 | 0) == (0 | 0);
     if (!$208) {
      $209 = HEAP32[392 >> 2] | 0;
      $210 = $207 >>> 0 < $209 >>> 0;
      if ($210) {
       _abort();
      } else {
       $211 = $R7$1 + 20 | 0;
       HEAP32[$211 >> 2] = $207;
       $212 = $207 + 24 | 0;
       HEAP32[$212 >> 2] = $R7$1;
       break;
      }
     }
    }
   }
  } while (0);
  $213 = $128 | 1;
  $214 = $$0 + 4 | 0;
  HEAP32[$214 >> 2] = $213;
  $215 = $$0 + $128 | 0;
  HEAP32[$215 >> 2] = $128;
  $216 = HEAP32[396 >> 2] | 0;
  $217 = ($$0 | 0) == ($216 | 0);
  if ($217) {
   HEAP32[384 >> 2] = $128;
   return;
  } else {
   $$1 = $128;
  }
 } else {
  $218 = $109 & -2;
  HEAP32[$108 >> 2] = $218;
  $219 = $$02 | 1;
  $220 = $$0 + 4 | 0;
  HEAP32[$220 >> 2] = $219;
  $221 = $$0 + $$02 | 0;
  HEAP32[$221 >> 2] = $$02;
  $$1 = $$02;
 }
 $222 = $$1 >>> 3;
 $223 = $$1 >>> 0 < 256;
 if ($223) {
  $224 = $222 << 1;
  $225 = 416 + ($224 << 2) | 0;
  $226 = HEAP32[376 >> 2] | 0;
  $227 = 1 << $222;
  $228 = $226 & $227;
  $229 = ($228 | 0) == 0;
  if ($229) {
   $230 = $226 | $227;
   HEAP32[376 >> 2] = $230;
   $$pre = $224 + 2 | 0;
   $$pre48 = 416 + ($$pre << 2) | 0;
   $$pre$phiZ2D = $$pre48;
   $F16$0 = $225;
  } else {
   $$sum7 = $224 + 2 | 0;
   $231 = 416 + ($$sum7 << 2) | 0;
   $232 = HEAP32[$231 >> 2] | 0;
   $233 = HEAP32[392 >> 2] | 0;
   $234 = $232 >>> 0 < $233 >>> 0;
   if ($234) {
    _abort();
   } else {
    $$pre$phiZ2D = $231;
    $F16$0 = $232;
   }
  }
  HEAP32[$$pre$phiZ2D >> 2] = $$0;
  $235 = $F16$0 + 12 | 0;
  HEAP32[$235 >> 2] = $$0;
  $236 = $$0 + 8 | 0;
  HEAP32[$236 >> 2] = $F16$0;
  $237 = $$0 + 12 | 0;
  HEAP32[$237 >> 2] = $225;
  return;
 }
 $238 = $$1 >>> 8;
 $239 = ($238 | 0) == 0;
 if ($239) {
  $I19$0 = 0;
 } else {
  $240 = $$1 >>> 0 > 16777215;
  if ($240) {
   $I19$0 = 31;
  } else {
   $241 = $238 + 1048320 | 0;
   $242 = $241 >>> 16;
   $243 = $242 & 8;
   $244 = $238 << $243;
   $245 = $244 + 520192 | 0;
   $246 = $245 >>> 16;
   $247 = $246 & 4;
   $248 = $247 | $243;
   $249 = $244 << $247;
   $250 = $249 + 245760 | 0;
   $251 = $250 >>> 16;
   $252 = $251 & 2;
   $253 = $248 | $252;
   $254 = 14 - $253 | 0;
   $255 = $249 << $252;
   $256 = $255 >>> 15;
   $257 = $254 + $256 | 0;
   $258 = $257 << 1;
   $259 = $257 + 7 | 0;
   $260 = $$1 >>> $259;
   $261 = $260 & 1;
   $262 = $261 | $258;
   $I19$0 = $262;
  }
 }
 $263 = 680 + ($I19$0 << 2) | 0;
 $264 = $$0 + 28 | 0;
 HEAP32[$264 >> 2] = $I19$0;
 $265 = $$0 + 16 | 0;
 $266 = $$0 + 20 | 0;
 HEAP32[$266 >> 2] = 0;
 HEAP32[$265 >> 2] = 0;
 $267 = HEAP32[380 >> 2] | 0;
 $268 = 1 << $I19$0;
 $269 = $267 & $268;
 $270 = ($269 | 0) == 0;
 if ($270) {
  $271 = $267 | $268;
  HEAP32[380 >> 2] = $271;
  HEAP32[$263 >> 2] = $$0;
  $272 = $$0 + 24 | 0;
  HEAP32[$272 >> 2] = $263;
  $273 = $$0 + 12 | 0;
  HEAP32[$273 >> 2] = $$0;
  $274 = $$0 + 8 | 0;
  HEAP32[$274 >> 2] = $$0;
  return;
 }
 $275 = HEAP32[$263 >> 2] | 0;
 $276 = $275 + 4 | 0;
 $277 = HEAP32[$276 >> 2] | 0;
 $278 = $277 & -8;
 $279 = ($278 | 0) == ($$1 | 0);
 L191 : do {
  if ($279) {
   $T$0$lcssa = $275;
  } else {
   $280 = ($I19$0 | 0) == 31;
   $281 = $I19$0 >>> 1;
   $282 = 25 - $281 | 0;
   $283 = $280 ? 0 : $282;
   $284 = $$1 << $283;
   $K20$043 = $284;
   $T$042 = $275;
   while (1) {
    $291 = $K20$043 >>> 31;
    $292 = ($T$042 + 16 | 0) + ($291 << 2) | 0;
    $287 = HEAP32[$292 >> 2] | 0;
    $293 = ($287 | 0) == (0 | 0);
    if ($293) {
     $$lcssa = $292;
     $T$042$lcssa = $T$042;
     break;
    }
    $285 = $K20$043 << 1;
    $286 = $287 + 4 | 0;
    $288 = HEAP32[$286 >> 2] | 0;
    $289 = $288 & -8;
    $290 = ($289 | 0) == ($$1 | 0);
    if ($290) {
     $T$0$lcssa = $287;
     break L191;
    } else {
     $K20$043 = $285;
     $T$042 = $287;
    }
   }
   $294 = HEAP32[392 >> 2] | 0;
   $295 = $$lcssa >>> 0 < $294 >>> 0;
   if ($295) {
    _abort();
   }
   HEAP32[$$lcssa >> 2] = $$0;
   $296 = $$0 + 24 | 0;
   HEAP32[$296 >> 2] = $T$042$lcssa;
   $297 = $$0 + 12 | 0;
   HEAP32[$297 >> 2] = $$0;
   $298 = $$0 + 8 | 0;
   HEAP32[$298 >> 2] = $$0;
   return;
  }
 } while (0);
 $299 = $T$0$lcssa + 8 | 0;
 $300 = HEAP32[$299 >> 2] | 0;
 $301 = HEAP32[392 >> 2] | 0;
 $302 = $300 >>> 0 >= $301 >>> 0;
 $not$ = $T$0$lcssa >>> 0 >= $301 >>> 0;
 $303 = $302 & $not$;
 if (!$303) {
  _abort();
 }
 $304 = $300 + 12 | 0;
 HEAP32[$304 >> 2] = $$0;
 HEAP32[$299 >> 2] = $$0;
 $305 = $$0 + 8 | 0;
 HEAP32[$305 >> 2] = $300;
 $306 = $$0 + 12 | 0;
 HEAP32[$306 >> 2] = $T$0$lcssa;
 $307 = $$0 + 24 | 0;
 HEAP32[$307 >> 2] = 0;
 return;
}

function _rhash_sha3_permutation($state) {
 $state = $state | 0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0;
 var $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0;
 var $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0;
 var $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0;
 var $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0;
 var $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0;
 var $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0;
 var $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0;
 var $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0;
 var $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $exitcond = 0, $round$01 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $state + 8 | 0;
 $1 = $state + 16 | 0;
 $2 = $state + 24 | 0;
 $3 = $state + 32 | 0;
 $4 = $state + 40 | 0;
 $5 = $state + 48 | 0;
 $6 = $state + 56 | 0;
 $7 = $state + 64 | 0;
 $8 = $state + 72 | 0;
 $9 = $state + 80 | 0;
 $10 = $state + 88 | 0;
 $11 = $state + 96 | 0;
 $12 = $state + 104 | 0;
 $13 = $state + 112 | 0;
 $14 = $state + 120 | 0;
 $15 = $state + 128 | 0;
 $16 = $state + 136 | 0;
 $17 = $state + 144 | 0;
 $18 = $state + 152 | 0;
 $19 = $state + 160 | 0;
 $20 = $state + 168 | 0;
 $21 = $state + 176 | 0;
 $22 = $state + 184 | 0;
 $23 = $state + 192 | 0;
 $round$01 = 0;
 while (1) {
  _keccak_theta($state);
  $24 = $0;
  $25 = $24;
  $26 = HEAP32[$25 >> 2] | 0;
  $27 = $24 + 4 | 0;
  $28 = $27;
  $29 = HEAP32[$28 >> 2] | 0;
  $30 = _bitshift64Shl($26 | 0, $29 | 0, 1) | 0;
  $31 = tempRet0;
  $32 = _bitshift64Lshr($26 | 0, $29 | 0, 63) | 0;
  $33 = tempRet0;
  $34 = $30 | $32;
  $35 = $31 | $33;
  $36 = $0;
  $37 = $36;
  HEAP32[$37 >> 2] = $34;
  $38 = $36 + 4 | 0;
  $39 = $38;
  HEAP32[$39 >> 2] = $35;
  $40 = $1;
  $41 = $40;
  $42 = HEAP32[$41 >> 2] | 0;
  $43 = $40 + 4 | 0;
  $44 = $43;
  $45 = HEAP32[$44 >> 2] | 0;
  $46 = _bitshift64Shl($42 | 0, $45 | 0, 62) | 0;
  $47 = tempRet0;
  $48 = _bitshift64Lshr($42 | 0, $45 | 0, 2) | 0;
  $49 = tempRet0;
  $50 = $46 | $48;
  $51 = $47 | $49;
  $52 = $1;
  $53 = $52;
  HEAP32[$53 >> 2] = $50;
  $54 = $52 + 4 | 0;
  $55 = $54;
  HEAP32[$55 >> 2] = $51;
  $56 = $2;
  $57 = $56;
  $58 = HEAP32[$57 >> 2] | 0;
  $59 = $56 + 4 | 0;
  $60 = $59;
  $61 = HEAP32[$60 >> 2] | 0;
  $62 = _bitshift64Shl($58 | 0, $61 | 0, 28) | 0;
  $63 = tempRet0;
  $64 = _bitshift64Lshr($58 | 0, $61 | 0, 36) | 0;
  $65 = tempRet0;
  $66 = $62 | $64;
  $67 = $63 | $65;
  $68 = $2;
  $69 = $68;
  HEAP32[$69 >> 2] = $66;
  $70 = $68 + 4 | 0;
  $71 = $70;
  HEAP32[$71 >> 2] = $67;
  $72 = $3;
  $73 = $72;
  $74 = HEAP32[$73 >> 2] | 0;
  $75 = $72 + 4 | 0;
  $76 = $75;
  $77 = HEAP32[$76 >> 2] | 0;
  $78 = _bitshift64Shl($74 | 0, $77 | 0, 27) | 0;
  $79 = tempRet0;
  $80 = _bitshift64Lshr($74 | 0, $77 | 0, 37) | 0;
  $81 = tempRet0;
  $82 = $78 | $80;
  $83 = $79 | $81;
  $84 = $3;
  $85 = $84;
  HEAP32[$85 >> 2] = $82;
  $86 = $84 + 4 | 0;
  $87 = $86;
  HEAP32[$87 >> 2] = $83;
  $88 = $4;
  $89 = $88;
  $90 = HEAP32[$89 >> 2] | 0;
  $91 = $88 + 4 | 0;
  $92 = $91;
  $93 = HEAP32[$92 >> 2] | 0;
  $94 = _bitshift64Shl($90 | 0, $93 | 0, 36) | 0;
  $95 = tempRet0;
  $96 = _bitshift64Lshr($90 | 0, $93 | 0, 28) | 0;
  $97 = tempRet0;
  $98 = $94 | $96;
  $99 = $95 | $97;
  $100 = $4;
  $101 = $100;
  HEAP32[$101 >> 2] = $98;
  $102 = $100 + 4 | 0;
  $103 = $102;
  HEAP32[$103 >> 2] = $99;
  $104 = $5;
  $105 = $104;
  $106 = HEAP32[$105 >> 2] | 0;
  $107 = $104 + 4 | 0;
  $108 = $107;
  $109 = HEAP32[$108 >> 2] | 0;
  $110 = _bitshift64Shl($106 | 0, $109 | 0, 44) | 0;
  $111 = tempRet0;
  $112 = _bitshift64Lshr($106 | 0, $109 | 0, 20) | 0;
  $113 = tempRet0;
  $114 = $110 | $112;
  $115 = $111 | $113;
  $116 = $5;
  $117 = $116;
  HEAP32[$117 >> 2] = $114;
  $118 = $116 + 4 | 0;
  $119 = $118;
  HEAP32[$119 >> 2] = $115;
  $120 = $6;
  $121 = $120;
  $122 = HEAP32[$121 >> 2] | 0;
  $123 = $120 + 4 | 0;
  $124 = $123;
  $125 = HEAP32[$124 >> 2] | 0;
  $126 = _bitshift64Shl($122 | 0, $125 | 0, 6) | 0;
  $127 = tempRet0;
  $128 = _bitshift64Lshr($122 | 0, $125 | 0, 58) | 0;
  $129 = tempRet0;
  $130 = $126 | $128;
  $131 = $127 | $129;
  $132 = $6;
  $133 = $132;
  HEAP32[$133 >> 2] = $130;
  $134 = $132 + 4 | 0;
  $135 = $134;
  HEAP32[$135 >> 2] = $131;
  $136 = $7;
  $137 = $136;
  $138 = HEAP32[$137 >> 2] | 0;
  $139 = $136 + 4 | 0;
  $140 = $139;
  $141 = HEAP32[$140 >> 2] | 0;
  $142 = _bitshift64Shl($138 | 0, $141 | 0, 55) | 0;
  $143 = tempRet0;
  $144 = _bitshift64Lshr($138 | 0, $141 | 0, 9) | 0;
  $145 = tempRet0;
  $146 = $142 | $144;
  $147 = $143 | $145;
  $148 = $7;
  $149 = $148;
  HEAP32[$149 >> 2] = $146;
  $150 = $148 + 4 | 0;
  $151 = $150;
  HEAP32[$151 >> 2] = $147;
  $152 = $8;
  $153 = $152;
  $154 = HEAP32[$153 >> 2] | 0;
  $155 = $152 + 4 | 0;
  $156 = $155;
  $157 = HEAP32[$156 >> 2] | 0;
  $158 = _bitshift64Shl($154 | 0, $157 | 0, 20) | 0;
  $159 = tempRet0;
  $160 = _bitshift64Lshr($154 | 0, $157 | 0, 44) | 0;
  $161 = tempRet0;
  $162 = $158 | $160;
  $163 = $159 | $161;
  $164 = $8;
  $165 = $164;
  HEAP32[$165 >> 2] = $162;
  $166 = $164 + 4 | 0;
  $167 = $166;
  HEAP32[$167 >> 2] = $163;
  $168 = $9;
  $169 = $168;
  $170 = HEAP32[$169 >> 2] | 0;
  $171 = $168 + 4 | 0;
  $172 = $171;
  $173 = HEAP32[$172 >> 2] | 0;
  $174 = _bitshift64Shl($170 | 0, $173 | 0, 3) | 0;
  $175 = tempRet0;
  $176 = _bitshift64Lshr($170 | 0, $173 | 0, 61) | 0;
  $177 = tempRet0;
  $178 = $174 | $176;
  $179 = $175 | $177;
  $180 = $9;
  $181 = $180;
  HEAP32[$181 >> 2] = $178;
  $182 = $180 + 4 | 0;
  $183 = $182;
  HEAP32[$183 >> 2] = $179;
  $184 = $10;
  $185 = $184;
  $186 = HEAP32[$185 >> 2] | 0;
  $187 = $184 + 4 | 0;
  $188 = $187;
  $189 = HEAP32[$188 >> 2] | 0;
  $190 = _bitshift64Shl($186 | 0, $189 | 0, 10) | 0;
  $191 = tempRet0;
  $192 = _bitshift64Lshr($186 | 0, $189 | 0, 54) | 0;
  $193 = tempRet0;
  $194 = $190 | $192;
  $195 = $191 | $193;
  $196 = $10;
  $197 = $196;
  HEAP32[$197 >> 2] = $194;
  $198 = $196 + 4 | 0;
  $199 = $198;
  HEAP32[$199 >> 2] = $195;
  $200 = $11;
  $201 = $200;
  $202 = HEAP32[$201 >> 2] | 0;
  $203 = $200 + 4 | 0;
  $204 = $203;
  $205 = HEAP32[$204 >> 2] | 0;
  $206 = _bitshift64Shl($202 | 0, $205 | 0, 43) | 0;
  $207 = tempRet0;
  $208 = _bitshift64Lshr($202 | 0, $205 | 0, 21) | 0;
  $209 = tempRet0;
  $210 = $206 | $208;
  $211 = $207 | $209;
  $212 = $11;
  $213 = $212;
  HEAP32[$213 >> 2] = $210;
  $214 = $212 + 4 | 0;
  $215 = $214;
  HEAP32[$215 >> 2] = $211;
  $216 = $12;
  $217 = $216;
  $218 = HEAP32[$217 >> 2] | 0;
  $219 = $216 + 4 | 0;
  $220 = $219;
  $221 = HEAP32[$220 >> 2] | 0;
  $222 = _bitshift64Shl($218 | 0, $221 | 0, 25) | 0;
  $223 = tempRet0;
  $224 = _bitshift64Lshr($218 | 0, $221 | 0, 39) | 0;
  $225 = tempRet0;
  $226 = $222 | $224;
  $227 = $223 | $225;
  $228 = $12;
  $229 = $228;
  HEAP32[$229 >> 2] = $226;
  $230 = $228 + 4 | 0;
  $231 = $230;
  HEAP32[$231 >> 2] = $227;
  $232 = $13;
  $233 = $232;
  $234 = HEAP32[$233 >> 2] | 0;
  $235 = $232 + 4 | 0;
  $236 = $235;
  $237 = HEAP32[$236 >> 2] | 0;
  $238 = _bitshift64Shl($234 | 0, $237 | 0, 39) | 0;
  $239 = tempRet0;
  $240 = _bitshift64Lshr($234 | 0, $237 | 0, 25) | 0;
  $241 = tempRet0;
  $242 = $238 | $240;
  $243 = $239 | $241;
  $244 = $13;
  $245 = $244;
  HEAP32[$245 >> 2] = $242;
  $246 = $244 + 4 | 0;
  $247 = $246;
  HEAP32[$247 >> 2] = $243;
  $248 = $14;
  $249 = $248;
  $250 = HEAP32[$249 >> 2] | 0;
  $251 = $248 + 4 | 0;
  $252 = $251;
  $253 = HEAP32[$252 >> 2] | 0;
  $254 = _bitshift64Shl($250 | 0, $253 | 0, 41) | 0;
  $255 = tempRet0;
  $256 = _bitshift64Lshr($250 | 0, $253 | 0, 23) | 0;
  $257 = tempRet0;
  $258 = $254 | $256;
  $259 = $255 | $257;
  $260 = $14;
  $261 = $260;
  HEAP32[$261 >> 2] = $258;
  $262 = $260 + 4 | 0;
  $263 = $262;
  HEAP32[$263 >> 2] = $259;
  $264 = $15;
  $265 = $264;
  $266 = HEAP32[$265 >> 2] | 0;
  $267 = $264 + 4 | 0;
  $268 = $267;
  $269 = HEAP32[$268 >> 2] | 0;
  $270 = _bitshift64Shl($266 | 0, $269 | 0, 45) | 0;
  $271 = tempRet0;
  $272 = _bitshift64Lshr($266 | 0, $269 | 0, 19) | 0;
  $273 = tempRet0;
  $274 = $270 | $272;
  $275 = $271 | $273;
  $276 = $15;
  $277 = $276;
  HEAP32[$277 >> 2] = $274;
  $278 = $276 + 4 | 0;
  $279 = $278;
  HEAP32[$279 >> 2] = $275;
  $280 = $16;
  $281 = $280;
  $282 = HEAP32[$281 >> 2] | 0;
  $283 = $280 + 4 | 0;
  $284 = $283;
  $285 = HEAP32[$284 >> 2] | 0;
  $286 = _bitshift64Shl($282 | 0, $285 | 0, 15) | 0;
  $287 = tempRet0;
  $288 = _bitshift64Lshr($282 | 0, $285 | 0, 49) | 0;
  $289 = tempRet0;
  $290 = $286 | $288;
  $291 = $287 | $289;
  $292 = $16;
  $293 = $292;
  HEAP32[$293 >> 2] = $290;
  $294 = $292 + 4 | 0;
  $295 = $294;
  HEAP32[$295 >> 2] = $291;
  $296 = $17;
  $297 = $296;
  $298 = HEAP32[$297 >> 2] | 0;
  $299 = $296 + 4 | 0;
  $300 = $299;
  $301 = HEAP32[$300 >> 2] | 0;
  $302 = _bitshift64Shl($298 | 0, $301 | 0, 21) | 0;
  $303 = tempRet0;
  $304 = _bitshift64Lshr($298 | 0, $301 | 0, 43) | 0;
  $305 = tempRet0;
  $306 = $302 | $304;
  $307 = $303 | $305;
  $308 = $17;
  $309 = $308;
  HEAP32[$309 >> 2] = $306;
  $310 = $308 + 4 | 0;
  $311 = $310;
  HEAP32[$311 >> 2] = $307;
  $312 = $18;
  $313 = $312;
  $314 = HEAP32[$313 >> 2] | 0;
  $315 = $312 + 4 | 0;
  $316 = $315;
  $317 = HEAP32[$316 >> 2] | 0;
  $318 = _bitshift64Shl($314 | 0, $317 | 0, 8) | 0;
  $319 = tempRet0;
  $320 = _bitshift64Lshr($314 | 0, $317 | 0, 56) | 0;
  $321 = tempRet0;
  $322 = $318 | $320;
  $323 = $319 | $321;
  $324 = $18;
  $325 = $324;
  HEAP32[$325 >> 2] = $322;
  $326 = $324 + 4 | 0;
  $327 = $326;
  HEAP32[$327 >> 2] = $323;
  $328 = $19;
  $329 = $328;
  $330 = HEAP32[$329 >> 2] | 0;
  $331 = $328 + 4 | 0;
  $332 = $331;
  $333 = HEAP32[$332 >> 2] | 0;
  $334 = _bitshift64Shl($330 | 0, $333 | 0, 18) | 0;
  $335 = tempRet0;
  $336 = _bitshift64Lshr($330 | 0, $333 | 0, 46) | 0;
  $337 = tempRet0;
  $338 = $334 | $336;
  $339 = $335 | $337;
  $340 = $19;
  $341 = $340;
  HEAP32[$341 >> 2] = $338;
  $342 = $340 + 4 | 0;
  $343 = $342;
  HEAP32[$343 >> 2] = $339;
  $344 = $20;
  $345 = $344;
  $346 = HEAP32[$345 >> 2] | 0;
  $347 = $344 + 4 | 0;
  $348 = $347;
  $349 = HEAP32[$348 >> 2] | 0;
  $350 = _bitshift64Shl($346 | 0, $349 | 0, 2) | 0;
  $351 = tempRet0;
  $352 = _bitshift64Lshr($346 | 0, $349 | 0, 62) | 0;
  $353 = tempRet0;
  $354 = $350 | $352;
  $355 = $351 | $353;
  $356 = $20;
  $357 = $356;
  HEAP32[$357 >> 2] = $354;
  $358 = $356 + 4 | 0;
  $359 = $358;
  HEAP32[$359 >> 2] = $355;
  $360 = $21;
  $361 = $360;
  $362 = HEAP32[$361 >> 2] | 0;
  $363 = $360 + 4 | 0;
  $364 = $363;
  $365 = HEAP32[$364 >> 2] | 0;
  $366 = _bitshift64Shl($362 | 0, $365 | 0, 61) | 0;
  $367 = tempRet0;
  $368 = _bitshift64Lshr($362 | 0, $365 | 0, 3) | 0;
  $369 = tempRet0;
  $370 = $366 | $368;
  $371 = $367 | $369;
  $372 = $21;
  $373 = $372;
  HEAP32[$373 >> 2] = $370;
  $374 = $372 + 4 | 0;
  $375 = $374;
  HEAP32[$375 >> 2] = $371;
  $376 = $22;
  $377 = $376;
  $378 = HEAP32[$377 >> 2] | 0;
  $379 = $376 + 4 | 0;
  $380 = $379;
  $381 = HEAP32[$380 >> 2] | 0;
  $382 = _bitshift64Shl($378 | 0, $381 | 0, 56) | 0;
  $383 = tempRet0;
  $384 = _bitshift64Lshr($378 | 0, $381 | 0, 8) | 0;
  $385 = tempRet0;
  $386 = $382 | $384;
  $387 = $383 | $385;
  $388 = $22;
  $389 = $388;
  HEAP32[$389 >> 2] = $386;
  $390 = $388 + 4 | 0;
  $391 = $390;
  HEAP32[$391 >> 2] = $387;
  $392 = $23;
  $393 = $392;
  $394 = HEAP32[$393 >> 2] | 0;
  $395 = $392 + 4 | 0;
  $396 = $395;
  $397 = HEAP32[$396 >> 2] | 0;
  $398 = _bitshift64Shl($394 | 0, $397 | 0, 14) | 0;
  $399 = tempRet0;
  $400 = _bitshift64Lshr($394 | 0, $397 | 0, 50) | 0;
  $401 = tempRet0;
  $402 = $398 | $400;
  $403 = $399 | $401;
  $404 = $23;
  $405 = $404;
  HEAP32[$405 >> 2] = $402;
  $406 = $404 + 4 | 0;
  $407 = $406;
  HEAP32[$407 >> 2] = $403;
  _keccak_pi($state);
  _keccak_chi($state);
  $408 = 8 + ($round$01 << 3) | 0;
  $409 = $408;
  $410 = $409;
  $411 = HEAP32[$410 >> 2] | 0;
  $412 = $409 + 4 | 0;
  $413 = $412;
  $414 = HEAP32[$413 >> 2] | 0;
  $415 = $state;
  $416 = $415;
  $417 = HEAP32[$416 >> 2] | 0;
  $418 = $415 + 4 | 0;
  $419 = $418;
  $420 = HEAP32[$419 >> 2] | 0;
  $421 = $417 ^ $411;
  $422 = $420 ^ $414;
  $423 = $state;
  $424 = $423;
  HEAP32[$424 >> 2] = $421;
  $425 = $423 + 4 | 0;
  $426 = $425;
  HEAP32[$426 >> 2] = $422;
  $427 = $round$01 + 1 | 0;
  $exitcond = ($427 | 0) == 24;
  if ($exitcond) {
   break;
  } else {
   $round$01 = $427;
  }
 }
 return;
}

function _keccak_theta($A) {
 $A = $A | 0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0;
 var $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0;
 var $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0;
 var $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0;
 var $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0;
 var $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0;
 var $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0;
 var $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0;
 var $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0;
 var $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0;
 var $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0;
 var $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $C = 0, $D = 0, $exitcond = 0, $x$11 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80 | 0;
 $C = sp + 40 | 0;
 $D = sp;
 $0 = $A;
 $1 = $0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $0 + 4 | 0;
 $4 = $3;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = $A + 40 | 0;
 $7 = $6;
 $8 = $7;
 $9 = HEAP32[$8 >> 2] | 0;
 $10 = $7 + 4 | 0;
 $11 = $10;
 $12 = HEAP32[$11 >> 2] | 0;
 $13 = $9 ^ $2;
 $14 = $12 ^ $5;
 $15 = $A + 80 | 0;
 $16 = $15;
 $17 = $16;
 $18 = HEAP32[$17 >> 2] | 0;
 $19 = $16 + 4 | 0;
 $20 = $19;
 $21 = HEAP32[$20 >> 2] | 0;
 $22 = $13 ^ $18;
 $23 = $14 ^ $21;
 $24 = $A + 120 | 0;
 $25 = $24;
 $26 = $25;
 $27 = HEAP32[$26 >> 2] | 0;
 $28 = $25 + 4 | 0;
 $29 = $28;
 $30 = HEAP32[$29 >> 2] | 0;
 $31 = $22 ^ $27;
 $32 = $23 ^ $30;
 $33 = $A + 160 | 0;
 $34 = $33;
 $35 = $34;
 $36 = HEAP32[$35 >> 2] | 0;
 $37 = $34 + 4 | 0;
 $38 = $37;
 $39 = HEAP32[$38 >> 2] | 0;
 $40 = $31 ^ $36;
 $41 = $32 ^ $39;
 $42 = $C;
 $43 = $42;
 HEAP32[$43 >> 2] = $40;
 $44 = $42 + 4 | 0;
 $45 = $44;
 HEAP32[$45 >> 2] = $41;
 $46 = $A + 8 | 0;
 $47 = $46;
 $48 = $47;
 $49 = HEAP32[$48 >> 2] | 0;
 $50 = $47 + 4 | 0;
 $51 = $50;
 $52 = HEAP32[$51 >> 2] | 0;
 $53 = $A + 48 | 0;
 $54 = $53;
 $55 = $54;
 $56 = HEAP32[$55 >> 2] | 0;
 $57 = $54 + 4 | 0;
 $58 = $57;
 $59 = HEAP32[$58 >> 2] | 0;
 $60 = $56 ^ $49;
 $61 = $59 ^ $52;
 $62 = $A + 88 | 0;
 $63 = $62;
 $64 = $63;
 $65 = HEAP32[$64 >> 2] | 0;
 $66 = $63 + 4 | 0;
 $67 = $66;
 $68 = HEAP32[$67 >> 2] | 0;
 $69 = $60 ^ $65;
 $70 = $61 ^ $68;
 $71 = $A + 128 | 0;
 $72 = $71;
 $73 = $72;
 $74 = HEAP32[$73 >> 2] | 0;
 $75 = $72 + 4 | 0;
 $76 = $75;
 $77 = HEAP32[$76 >> 2] | 0;
 $78 = $69 ^ $74;
 $79 = $70 ^ $77;
 $80 = $A + 168 | 0;
 $81 = $80;
 $82 = $81;
 $83 = HEAP32[$82 >> 2] | 0;
 $84 = $81 + 4 | 0;
 $85 = $84;
 $86 = HEAP32[$85 >> 2] | 0;
 $87 = $78 ^ $83;
 $88 = $79 ^ $86;
 $89 = $C + 8 | 0;
 $90 = $89;
 $91 = $90;
 HEAP32[$91 >> 2] = $87;
 $92 = $90 + 4 | 0;
 $93 = $92;
 HEAP32[$93 >> 2] = $88;
 $94 = $A + 16 | 0;
 $95 = $94;
 $96 = $95;
 $97 = HEAP32[$96 >> 2] | 0;
 $98 = $95 + 4 | 0;
 $99 = $98;
 $100 = HEAP32[$99 >> 2] | 0;
 $101 = $A + 56 | 0;
 $102 = $101;
 $103 = $102;
 $104 = HEAP32[$103 >> 2] | 0;
 $105 = $102 + 4 | 0;
 $106 = $105;
 $107 = HEAP32[$106 >> 2] | 0;
 $108 = $104 ^ $97;
 $109 = $107 ^ $100;
 $110 = $A + 96 | 0;
 $111 = $110;
 $112 = $111;
 $113 = HEAP32[$112 >> 2] | 0;
 $114 = $111 + 4 | 0;
 $115 = $114;
 $116 = HEAP32[$115 >> 2] | 0;
 $117 = $108 ^ $113;
 $118 = $109 ^ $116;
 $119 = $A + 136 | 0;
 $120 = $119;
 $121 = $120;
 $122 = HEAP32[$121 >> 2] | 0;
 $123 = $120 + 4 | 0;
 $124 = $123;
 $125 = HEAP32[$124 >> 2] | 0;
 $126 = $117 ^ $122;
 $127 = $118 ^ $125;
 $128 = $A + 176 | 0;
 $129 = $128;
 $130 = $129;
 $131 = HEAP32[$130 >> 2] | 0;
 $132 = $129 + 4 | 0;
 $133 = $132;
 $134 = HEAP32[$133 >> 2] | 0;
 $135 = $126 ^ $131;
 $136 = $127 ^ $134;
 $137 = $C + 16 | 0;
 $138 = $137;
 $139 = $138;
 HEAP32[$139 >> 2] = $135;
 $140 = $138 + 4 | 0;
 $141 = $140;
 HEAP32[$141 >> 2] = $136;
 $142 = $A + 24 | 0;
 $143 = $142;
 $144 = $143;
 $145 = HEAP32[$144 >> 2] | 0;
 $146 = $143 + 4 | 0;
 $147 = $146;
 $148 = HEAP32[$147 >> 2] | 0;
 $149 = $A + 64 | 0;
 $150 = $149;
 $151 = $150;
 $152 = HEAP32[$151 >> 2] | 0;
 $153 = $150 + 4 | 0;
 $154 = $153;
 $155 = HEAP32[$154 >> 2] | 0;
 $156 = $152 ^ $145;
 $157 = $155 ^ $148;
 $158 = $A + 104 | 0;
 $159 = $158;
 $160 = $159;
 $161 = HEAP32[$160 >> 2] | 0;
 $162 = $159 + 4 | 0;
 $163 = $162;
 $164 = HEAP32[$163 >> 2] | 0;
 $165 = $156 ^ $161;
 $166 = $157 ^ $164;
 $167 = $A + 144 | 0;
 $168 = $167;
 $169 = $168;
 $170 = HEAP32[$169 >> 2] | 0;
 $171 = $168 + 4 | 0;
 $172 = $171;
 $173 = HEAP32[$172 >> 2] | 0;
 $174 = $165 ^ $170;
 $175 = $166 ^ $173;
 $176 = $A + 184 | 0;
 $177 = $176;
 $178 = $177;
 $179 = HEAP32[$178 >> 2] | 0;
 $180 = $177 + 4 | 0;
 $181 = $180;
 $182 = HEAP32[$181 >> 2] | 0;
 $183 = $174 ^ $179;
 $184 = $175 ^ $182;
 $185 = $C + 24 | 0;
 $186 = $185;
 $187 = $186;
 HEAP32[$187 >> 2] = $183;
 $188 = $186 + 4 | 0;
 $189 = $188;
 HEAP32[$189 >> 2] = $184;
 $190 = $A + 32 | 0;
 $191 = $190;
 $192 = $191;
 $193 = HEAP32[$192 >> 2] | 0;
 $194 = $191 + 4 | 0;
 $195 = $194;
 $196 = HEAP32[$195 >> 2] | 0;
 $197 = $A + 72 | 0;
 $198 = $197;
 $199 = $198;
 $200 = HEAP32[$199 >> 2] | 0;
 $201 = $198 + 4 | 0;
 $202 = $201;
 $203 = HEAP32[$202 >> 2] | 0;
 $204 = $200 ^ $193;
 $205 = $203 ^ $196;
 $206 = $A + 112 | 0;
 $207 = $206;
 $208 = $207;
 $209 = HEAP32[$208 >> 2] | 0;
 $210 = $207 + 4 | 0;
 $211 = $210;
 $212 = HEAP32[$211 >> 2] | 0;
 $213 = $204 ^ $209;
 $214 = $205 ^ $212;
 $215 = $A + 152 | 0;
 $216 = $215;
 $217 = $216;
 $218 = HEAP32[$217 >> 2] | 0;
 $219 = $216 + 4 | 0;
 $220 = $219;
 $221 = HEAP32[$220 >> 2] | 0;
 $222 = $213 ^ $218;
 $223 = $214 ^ $221;
 $224 = $A + 192 | 0;
 $225 = $224;
 $226 = $225;
 $227 = HEAP32[$226 >> 2] | 0;
 $228 = $225 + 4 | 0;
 $229 = $228;
 $230 = HEAP32[$229 >> 2] | 0;
 $231 = $222 ^ $227;
 $232 = $223 ^ $230;
 $233 = $C + 32 | 0;
 $234 = $233;
 $235 = $234;
 HEAP32[$235 >> 2] = $231;
 $236 = $234 + 4 | 0;
 $237 = $236;
 HEAP32[$237 >> 2] = $232;
 $238 = $C + 8 | 0;
 $239 = $238;
 $240 = $239;
 $241 = HEAP32[$240 >> 2] | 0;
 $242 = $239 + 4 | 0;
 $243 = $242;
 $244 = HEAP32[$243 >> 2] | 0;
 $245 = _bitshift64Shl($241 | 0, $244 | 0, 1) | 0;
 $246 = tempRet0;
 $247 = _bitshift64Lshr($241 | 0, $244 | 0, 63) | 0;
 $248 = tempRet0;
 $249 = $245 | $247;
 $250 = $246 | $248;
 $251 = $C + 32 | 0;
 $252 = $251;
 $253 = $252;
 $254 = HEAP32[$253 >> 2] | 0;
 $255 = $252 + 4 | 0;
 $256 = $255;
 $257 = HEAP32[$256 >> 2] | 0;
 $258 = $249 ^ $254;
 $259 = $250 ^ $257;
 $260 = $D;
 $261 = $260;
 HEAP32[$261 >> 2] = $258;
 $262 = $260 + 4 | 0;
 $263 = $262;
 HEAP32[$263 >> 2] = $259;
 $264 = $C + 16 | 0;
 $265 = $264;
 $266 = $265;
 $267 = HEAP32[$266 >> 2] | 0;
 $268 = $265 + 4 | 0;
 $269 = $268;
 $270 = HEAP32[$269 >> 2] | 0;
 $271 = _bitshift64Shl($267 | 0, $270 | 0, 1) | 0;
 $272 = tempRet0;
 $273 = _bitshift64Lshr($267 | 0, $270 | 0, 63) | 0;
 $274 = tempRet0;
 $275 = $271 | $273;
 $276 = $272 | $274;
 $277 = $C;
 $278 = $277;
 $279 = HEAP32[$278 >> 2] | 0;
 $280 = $277 + 4 | 0;
 $281 = $280;
 $282 = HEAP32[$281 >> 2] | 0;
 $283 = $275 ^ $279;
 $284 = $276 ^ $282;
 $285 = $D + 8 | 0;
 $286 = $285;
 $287 = $286;
 HEAP32[$287 >> 2] = $283;
 $288 = $286 + 4 | 0;
 $289 = $288;
 HEAP32[$289 >> 2] = $284;
 $290 = $C + 24 | 0;
 $291 = $290;
 $292 = $291;
 $293 = HEAP32[$292 >> 2] | 0;
 $294 = $291 + 4 | 0;
 $295 = $294;
 $296 = HEAP32[$295 >> 2] | 0;
 $297 = _bitshift64Shl($293 | 0, $296 | 0, 1) | 0;
 $298 = tempRet0;
 $299 = _bitshift64Lshr($293 | 0, $296 | 0, 63) | 0;
 $300 = tempRet0;
 $301 = $297 | $299;
 $302 = $298 | $300;
 $303 = $238;
 $304 = $303;
 $305 = HEAP32[$304 >> 2] | 0;
 $306 = $303 + 4 | 0;
 $307 = $306;
 $308 = HEAP32[$307 >> 2] | 0;
 $309 = $301 ^ $305;
 $310 = $302 ^ $308;
 $311 = $D + 16 | 0;
 $312 = $311;
 $313 = $312;
 HEAP32[$313 >> 2] = $309;
 $314 = $312 + 4 | 0;
 $315 = $314;
 HEAP32[$315 >> 2] = $310;
 $316 = $251;
 $317 = $316;
 $318 = HEAP32[$317 >> 2] | 0;
 $319 = $316 + 4 | 0;
 $320 = $319;
 $321 = HEAP32[$320 >> 2] | 0;
 $322 = _bitshift64Shl($318 | 0, $321 | 0, 1) | 0;
 $323 = tempRet0;
 $324 = _bitshift64Lshr($318 | 0, $321 | 0, 63) | 0;
 $325 = tempRet0;
 $326 = $322 | $324;
 $327 = $323 | $325;
 $328 = $264;
 $329 = $328;
 $330 = HEAP32[$329 >> 2] | 0;
 $331 = $328 + 4 | 0;
 $332 = $331;
 $333 = HEAP32[$332 >> 2] | 0;
 $334 = $326 ^ $330;
 $335 = $327 ^ $333;
 $336 = $D + 24 | 0;
 $337 = $336;
 $338 = $337;
 HEAP32[$338 >> 2] = $334;
 $339 = $337 + 4 | 0;
 $340 = $339;
 HEAP32[$340 >> 2] = $335;
 $341 = $C;
 $342 = $341;
 $343 = HEAP32[$342 >> 2] | 0;
 $344 = $341 + 4 | 0;
 $345 = $344;
 $346 = HEAP32[$345 >> 2] | 0;
 $347 = _bitshift64Shl($343 | 0, $346 | 0, 1) | 0;
 $348 = tempRet0;
 $349 = _bitshift64Lshr($343 | 0, $346 | 0, 63) | 0;
 $350 = tempRet0;
 $351 = $347 | $349;
 $352 = $348 | $350;
 $353 = $290;
 $354 = $353;
 $355 = HEAP32[$354 >> 2] | 0;
 $356 = $353 + 4 | 0;
 $357 = $356;
 $358 = HEAP32[$357 >> 2] | 0;
 $359 = $351 ^ $355;
 $360 = $352 ^ $358;
 $361 = $D + 32 | 0;
 $362 = $361;
 $363 = $362;
 HEAP32[$363 >> 2] = $359;
 $364 = $362 + 4 | 0;
 $365 = $364;
 HEAP32[$365 >> 2] = $360;
 $x$11 = 0;
 while (1) {
  $366 = $D + ($x$11 << 3) | 0;
  $367 = $366;
  $368 = $367;
  $369 = HEAP32[$368 >> 2] | 0;
  $370 = $367 + 4 | 0;
  $371 = $370;
  $372 = HEAP32[$371 >> 2] | 0;
  $373 = $A + ($x$11 << 3) | 0;
  $374 = $373;
  $375 = $374;
  $376 = HEAP32[$375 >> 2] | 0;
  $377 = $374 + 4 | 0;
  $378 = $377;
  $379 = HEAP32[$378 >> 2] | 0;
  $380 = $376 ^ $369;
  $381 = $379 ^ $372;
  $382 = $373;
  $383 = $382;
  HEAP32[$383 >> 2] = $380;
  $384 = $382 + 4 | 0;
  $385 = $384;
  HEAP32[$385 >> 2] = $381;
  $386 = $366;
  $387 = $386;
  $388 = HEAP32[$387 >> 2] | 0;
  $389 = $386 + 4 | 0;
  $390 = $389;
  $391 = HEAP32[$390 >> 2] | 0;
  $392 = $x$11 + 5 | 0;
  $393 = $A + ($392 << 3) | 0;
  $394 = $393;
  $395 = $394;
  $396 = HEAP32[$395 >> 2] | 0;
  $397 = $394 + 4 | 0;
  $398 = $397;
  $399 = HEAP32[$398 >> 2] | 0;
  $400 = $396 ^ $388;
  $401 = $399 ^ $391;
  $402 = $393;
  $403 = $402;
  HEAP32[$403 >> 2] = $400;
  $404 = $402 + 4 | 0;
  $405 = $404;
  HEAP32[$405 >> 2] = $401;
  $406 = $366;
  $407 = $406;
  $408 = HEAP32[$407 >> 2] | 0;
  $409 = $406 + 4 | 0;
  $410 = $409;
  $411 = HEAP32[$410 >> 2] | 0;
  $412 = $x$11 + 10 | 0;
  $413 = $A + ($412 << 3) | 0;
  $414 = $413;
  $415 = $414;
  $416 = HEAP32[$415 >> 2] | 0;
  $417 = $414 + 4 | 0;
  $418 = $417;
  $419 = HEAP32[$418 >> 2] | 0;
  $420 = $416 ^ $408;
  $421 = $419 ^ $411;
  $422 = $413;
  $423 = $422;
  HEAP32[$423 >> 2] = $420;
  $424 = $422 + 4 | 0;
  $425 = $424;
  HEAP32[$425 >> 2] = $421;
  $426 = $366;
  $427 = $426;
  $428 = HEAP32[$427 >> 2] | 0;
  $429 = $426 + 4 | 0;
  $430 = $429;
  $431 = HEAP32[$430 >> 2] | 0;
  $432 = $x$11 + 15 | 0;
  $433 = $A + ($432 << 3) | 0;
  $434 = $433;
  $435 = $434;
  $436 = HEAP32[$435 >> 2] | 0;
  $437 = $434 + 4 | 0;
  $438 = $437;
  $439 = HEAP32[$438 >> 2] | 0;
  $440 = $436 ^ $428;
  $441 = $439 ^ $431;
  $442 = $433;
  $443 = $442;
  HEAP32[$443 >> 2] = $440;
  $444 = $442 + 4 | 0;
  $445 = $444;
  HEAP32[$445 >> 2] = $441;
  $446 = $366;
  $447 = $446;
  $448 = HEAP32[$447 >> 2] | 0;
  $449 = $446 + 4 | 0;
  $450 = $449;
  $451 = HEAP32[$450 >> 2] | 0;
  $452 = $x$11 + 20 | 0;
  $453 = $A + ($452 << 3) | 0;
  $454 = $453;
  $455 = $454;
  $456 = HEAP32[$455 >> 2] | 0;
  $457 = $454 + 4 | 0;
  $458 = $457;
  $459 = HEAP32[$458 >> 2] | 0;
  $460 = $456 ^ $448;
  $461 = $459 ^ $451;
  $462 = $453;
  $463 = $462;
  HEAP32[$463 >> 2] = $460;
  $464 = $462 + 4 | 0;
  $465 = $464;
  HEAP32[$465 >> 2] = $461;
  $466 = $x$11 + 1 | 0;
  $exitcond = ($466 | 0) == 5;
  if ($exitcond) {
   break;
  } else {
   $x$11 = $466;
  }
 }
 STACKTOP = sp;
 return;
}

function _rhash_sha3_process_block($hash, $block, $block_size) {
 $hash = $hash | 0;
 $block = $block | 0;
 $block_size = $block_size | 0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0;
 var $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0;
 var $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
 var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0;
 var $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0;
 var $99 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $block;
 $1 = $0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $0 + 4 | 0;
 $4 = $3;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = $hash;
 $7 = $6;
 $8 = HEAP32[$7 >> 2] | 0;
 $9 = $6 + 4 | 0;
 $10 = $9;
 $11 = HEAP32[$10 >> 2] | 0;
 $12 = $8 ^ $2;
 $13 = $11 ^ $5;
 $14 = $hash;
 $15 = $14;
 HEAP32[$15 >> 2] = $12;
 $16 = $14 + 4 | 0;
 $17 = $16;
 HEAP32[$17 >> 2] = $13;
 $18 = $block + 8 | 0;
 $19 = $18;
 $20 = $19;
 $21 = HEAP32[$20 >> 2] | 0;
 $22 = $19 + 4 | 0;
 $23 = $22;
 $24 = HEAP32[$23 >> 2] | 0;
 $25 = $hash + 8 | 0;
 $26 = $25;
 $27 = $26;
 $28 = HEAP32[$27 >> 2] | 0;
 $29 = $26 + 4 | 0;
 $30 = $29;
 $31 = HEAP32[$30 >> 2] | 0;
 $32 = $28 ^ $21;
 $33 = $31 ^ $24;
 $34 = $25;
 $35 = $34;
 HEAP32[$35 >> 2] = $32;
 $36 = $34 + 4 | 0;
 $37 = $36;
 HEAP32[$37 >> 2] = $33;
 $38 = $block + 16 | 0;
 $39 = $38;
 $40 = $39;
 $41 = HEAP32[$40 >> 2] | 0;
 $42 = $39 + 4 | 0;
 $43 = $42;
 $44 = HEAP32[$43 >> 2] | 0;
 $45 = $hash + 16 | 0;
 $46 = $45;
 $47 = $46;
 $48 = HEAP32[$47 >> 2] | 0;
 $49 = $46 + 4 | 0;
 $50 = $49;
 $51 = HEAP32[$50 >> 2] | 0;
 $52 = $48 ^ $41;
 $53 = $51 ^ $44;
 $54 = $45;
 $55 = $54;
 HEAP32[$55 >> 2] = $52;
 $56 = $54 + 4 | 0;
 $57 = $56;
 HEAP32[$57 >> 2] = $53;
 $58 = $block + 24 | 0;
 $59 = $58;
 $60 = $59;
 $61 = HEAP32[$60 >> 2] | 0;
 $62 = $59 + 4 | 0;
 $63 = $62;
 $64 = HEAP32[$63 >> 2] | 0;
 $65 = $hash + 24 | 0;
 $66 = $65;
 $67 = $66;
 $68 = HEAP32[$67 >> 2] | 0;
 $69 = $66 + 4 | 0;
 $70 = $69;
 $71 = HEAP32[$70 >> 2] | 0;
 $72 = $68 ^ $61;
 $73 = $71 ^ $64;
 $74 = $65;
 $75 = $74;
 HEAP32[$75 >> 2] = $72;
 $76 = $74 + 4 | 0;
 $77 = $76;
 HEAP32[$77 >> 2] = $73;
 $78 = $block + 32 | 0;
 $79 = $78;
 $80 = $79;
 $81 = HEAP32[$80 >> 2] | 0;
 $82 = $79 + 4 | 0;
 $83 = $82;
 $84 = HEAP32[$83 >> 2] | 0;
 $85 = $hash + 32 | 0;
 $86 = $85;
 $87 = $86;
 $88 = HEAP32[$87 >> 2] | 0;
 $89 = $86 + 4 | 0;
 $90 = $89;
 $91 = HEAP32[$90 >> 2] | 0;
 $92 = $88 ^ $81;
 $93 = $91 ^ $84;
 $94 = $85;
 $95 = $94;
 HEAP32[$95 >> 2] = $92;
 $96 = $94 + 4 | 0;
 $97 = $96;
 HEAP32[$97 >> 2] = $93;
 $98 = $block + 40 | 0;
 $99 = $98;
 $100 = $99;
 $101 = HEAP32[$100 >> 2] | 0;
 $102 = $99 + 4 | 0;
 $103 = $102;
 $104 = HEAP32[$103 >> 2] | 0;
 $105 = $hash + 40 | 0;
 $106 = $105;
 $107 = $106;
 $108 = HEAP32[$107 >> 2] | 0;
 $109 = $106 + 4 | 0;
 $110 = $109;
 $111 = HEAP32[$110 >> 2] | 0;
 $112 = $108 ^ $101;
 $113 = $111 ^ $104;
 $114 = $105;
 $115 = $114;
 HEAP32[$115 >> 2] = $112;
 $116 = $114 + 4 | 0;
 $117 = $116;
 HEAP32[$117 >> 2] = $113;
 $118 = $block + 48 | 0;
 $119 = $118;
 $120 = $119;
 $121 = HEAP32[$120 >> 2] | 0;
 $122 = $119 + 4 | 0;
 $123 = $122;
 $124 = HEAP32[$123 >> 2] | 0;
 $125 = $hash + 48 | 0;
 $126 = $125;
 $127 = $126;
 $128 = HEAP32[$127 >> 2] | 0;
 $129 = $126 + 4 | 0;
 $130 = $129;
 $131 = HEAP32[$130 >> 2] | 0;
 $132 = $128 ^ $121;
 $133 = $131 ^ $124;
 $134 = $125;
 $135 = $134;
 HEAP32[$135 >> 2] = $132;
 $136 = $134 + 4 | 0;
 $137 = $136;
 HEAP32[$137 >> 2] = $133;
 $138 = $block + 56 | 0;
 $139 = $138;
 $140 = $139;
 $141 = HEAP32[$140 >> 2] | 0;
 $142 = $139 + 4 | 0;
 $143 = $142;
 $144 = HEAP32[$143 >> 2] | 0;
 $145 = $hash + 56 | 0;
 $146 = $145;
 $147 = $146;
 $148 = HEAP32[$147 >> 2] | 0;
 $149 = $146 + 4 | 0;
 $150 = $149;
 $151 = HEAP32[$150 >> 2] | 0;
 $152 = $148 ^ $141;
 $153 = $151 ^ $144;
 $154 = $145;
 $155 = $154;
 HEAP32[$155 >> 2] = $152;
 $156 = $154 + 4 | 0;
 $157 = $156;
 HEAP32[$157 >> 2] = $153;
 $158 = $block + 64 | 0;
 $159 = $158;
 $160 = $159;
 $161 = HEAP32[$160 >> 2] | 0;
 $162 = $159 + 4 | 0;
 $163 = $162;
 $164 = HEAP32[$163 >> 2] | 0;
 $165 = $hash + 64 | 0;
 $166 = $165;
 $167 = $166;
 $168 = HEAP32[$167 >> 2] | 0;
 $169 = $166 + 4 | 0;
 $170 = $169;
 $171 = HEAP32[$170 >> 2] | 0;
 $172 = $168 ^ $161;
 $173 = $171 ^ $164;
 $174 = $165;
 $175 = $174;
 HEAP32[$175 >> 2] = $172;
 $176 = $174 + 4 | 0;
 $177 = $176;
 HEAP32[$177 >> 2] = $173;
 $178 = $block_size >>> 0 > 72;
 if (!$178) {
  _rhash_sha3_permutation($hash);
  return;
 }
 $179 = $block + 72 | 0;
 $180 = $179;
 $181 = $180;
 $182 = HEAP32[$181 >> 2] | 0;
 $183 = $180 + 4 | 0;
 $184 = $183;
 $185 = HEAP32[$184 >> 2] | 0;
 $186 = $hash + 72 | 0;
 $187 = $186;
 $188 = $187;
 $189 = HEAP32[$188 >> 2] | 0;
 $190 = $187 + 4 | 0;
 $191 = $190;
 $192 = HEAP32[$191 >> 2] | 0;
 $193 = $189 ^ $182;
 $194 = $192 ^ $185;
 $195 = $186;
 $196 = $195;
 HEAP32[$196 >> 2] = $193;
 $197 = $195 + 4 | 0;
 $198 = $197;
 HEAP32[$198 >> 2] = $194;
 $199 = $block + 80 | 0;
 $200 = $199;
 $201 = $200;
 $202 = HEAP32[$201 >> 2] | 0;
 $203 = $200 + 4 | 0;
 $204 = $203;
 $205 = HEAP32[$204 >> 2] | 0;
 $206 = $hash + 80 | 0;
 $207 = $206;
 $208 = $207;
 $209 = HEAP32[$208 >> 2] | 0;
 $210 = $207 + 4 | 0;
 $211 = $210;
 $212 = HEAP32[$211 >> 2] | 0;
 $213 = $209 ^ $202;
 $214 = $212 ^ $205;
 $215 = $206;
 $216 = $215;
 HEAP32[$216 >> 2] = $213;
 $217 = $215 + 4 | 0;
 $218 = $217;
 HEAP32[$218 >> 2] = $214;
 $219 = $block + 88 | 0;
 $220 = $219;
 $221 = $220;
 $222 = HEAP32[$221 >> 2] | 0;
 $223 = $220 + 4 | 0;
 $224 = $223;
 $225 = HEAP32[$224 >> 2] | 0;
 $226 = $hash + 88 | 0;
 $227 = $226;
 $228 = $227;
 $229 = HEAP32[$228 >> 2] | 0;
 $230 = $227 + 4 | 0;
 $231 = $230;
 $232 = HEAP32[$231 >> 2] | 0;
 $233 = $229 ^ $222;
 $234 = $232 ^ $225;
 $235 = $226;
 $236 = $235;
 HEAP32[$236 >> 2] = $233;
 $237 = $235 + 4 | 0;
 $238 = $237;
 HEAP32[$238 >> 2] = $234;
 $239 = $block + 96 | 0;
 $240 = $239;
 $241 = $240;
 $242 = HEAP32[$241 >> 2] | 0;
 $243 = $240 + 4 | 0;
 $244 = $243;
 $245 = HEAP32[$244 >> 2] | 0;
 $246 = $hash + 96 | 0;
 $247 = $246;
 $248 = $247;
 $249 = HEAP32[$248 >> 2] | 0;
 $250 = $247 + 4 | 0;
 $251 = $250;
 $252 = HEAP32[$251 >> 2] | 0;
 $253 = $249 ^ $242;
 $254 = $252 ^ $245;
 $255 = $246;
 $256 = $255;
 HEAP32[$256 >> 2] = $253;
 $257 = $255 + 4 | 0;
 $258 = $257;
 HEAP32[$258 >> 2] = $254;
 $259 = $block_size >>> 0 > 104;
 if (!$259) {
  _rhash_sha3_permutation($hash);
  return;
 }
 $260 = $block + 104 | 0;
 $261 = $260;
 $262 = $261;
 $263 = HEAP32[$262 >> 2] | 0;
 $264 = $261 + 4 | 0;
 $265 = $264;
 $266 = HEAP32[$265 >> 2] | 0;
 $267 = $hash + 104 | 0;
 $268 = $267;
 $269 = $268;
 $270 = HEAP32[$269 >> 2] | 0;
 $271 = $268 + 4 | 0;
 $272 = $271;
 $273 = HEAP32[$272 >> 2] | 0;
 $274 = $270 ^ $263;
 $275 = $273 ^ $266;
 $276 = $267;
 $277 = $276;
 HEAP32[$277 >> 2] = $274;
 $278 = $276 + 4 | 0;
 $279 = $278;
 HEAP32[$279 >> 2] = $275;
 $280 = $block + 112 | 0;
 $281 = $280;
 $282 = $281;
 $283 = HEAP32[$282 >> 2] | 0;
 $284 = $281 + 4 | 0;
 $285 = $284;
 $286 = HEAP32[$285 >> 2] | 0;
 $287 = $hash + 112 | 0;
 $288 = $287;
 $289 = $288;
 $290 = HEAP32[$289 >> 2] | 0;
 $291 = $288 + 4 | 0;
 $292 = $291;
 $293 = HEAP32[$292 >> 2] | 0;
 $294 = $290 ^ $283;
 $295 = $293 ^ $286;
 $296 = $287;
 $297 = $296;
 HEAP32[$297 >> 2] = $294;
 $298 = $296 + 4 | 0;
 $299 = $298;
 HEAP32[$299 >> 2] = $295;
 $300 = $block + 120 | 0;
 $301 = $300;
 $302 = $301;
 $303 = HEAP32[$302 >> 2] | 0;
 $304 = $301 + 4 | 0;
 $305 = $304;
 $306 = HEAP32[$305 >> 2] | 0;
 $307 = $hash + 120 | 0;
 $308 = $307;
 $309 = $308;
 $310 = HEAP32[$309 >> 2] | 0;
 $311 = $308 + 4 | 0;
 $312 = $311;
 $313 = HEAP32[$312 >> 2] | 0;
 $314 = $310 ^ $303;
 $315 = $313 ^ $306;
 $316 = $307;
 $317 = $316;
 HEAP32[$317 >> 2] = $314;
 $318 = $316 + 4 | 0;
 $319 = $318;
 HEAP32[$319 >> 2] = $315;
 $320 = $block + 128 | 0;
 $321 = $320;
 $322 = $321;
 $323 = HEAP32[$322 >> 2] | 0;
 $324 = $321 + 4 | 0;
 $325 = $324;
 $326 = HEAP32[$325 >> 2] | 0;
 $327 = $hash + 128 | 0;
 $328 = $327;
 $329 = $328;
 $330 = HEAP32[$329 >> 2] | 0;
 $331 = $328 + 4 | 0;
 $332 = $331;
 $333 = HEAP32[$332 >> 2] | 0;
 $334 = $330 ^ $323;
 $335 = $333 ^ $326;
 $336 = $327;
 $337 = $336;
 HEAP32[$337 >> 2] = $334;
 $338 = $336 + 4 | 0;
 $339 = $338;
 HEAP32[$339 >> 2] = $335;
 $340 = $block_size >>> 0 > 136;
 if (!$340) {
  _rhash_sha3_permutation($hash);
  return;
 }
 $341 = $block + 136 | 0;
 $342 = $341;
 $343 = $342;
 $344 = HEAP32[$343 >> 2] | 0;
 $345 = $342 + 4 | 0;
 $346 = $345;
 $347 = HEAP32[$346 >> 2] | 0;
 $348 = $hash + 136 | 0;
 $349 = $348;
 $350 = $349;
 $351 = HEAP32[$350 >> 2] | 0;
 $352 = $349 + 4 | 0;
 $353 = $352;
 $354 = HEAP32[$353 >> 2] | 0;
 $355 = $351 ^ $344;
 $356 = $354 ^ $347;
 $357 = $348;
 $358 = $357;
 HEAP32[$358 >> 2] = $355;
 $359 = $357 + 4 | 0;
 $360 = $359;
 HEAP32[$360 >> 2] = $356;
 _rhash_sha3_permutation($hash);
 return;
}

function _try_realloc_chunk($p, $nb) {
 $p = $p | 0;
 $nb = $nb | 0;
 var $$pre = 0, $$pre$phiZ2D = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum2728 = 0, $$sum3 = 0, $$sum4 = 0, $$sum5 = 0, $$sum78 = 0;
 var $$sum910 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0;
 var $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0;
 var $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0;
 var $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0;
 var $17 = 0, $170 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0;
 var $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0;
 var $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0;
 var $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0;
 var $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $R$0 = 0, $R$0$lcssa = 0, $R$1 = 0, $RP$0 = 0, $RP$0$lcssa = 0, $cond = 0, $newp$0 = 0, $notlhs = 0;
 var $notrhs = 0, $or$cond$not = 0, $or$cond30 = 0, $storemerge = 0, $storemerge21 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $p + 4 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 $2 = $1 & -8;
 $3 = $p + $2 | 0;
 $4 = HEAP32[392 >> 2] | 0;
 $5 = $1 & 3;
 $notlhs = $p >>> 0 >= $4 >>> 0;
 $notrhs = ($5 | 0) != 1;
 $or$cond$not = $notrhs & $notlhs;
 $6 = $p >>> 0 < $3 >>> 0;
 $or$cond30 = $or$cond$not & $6;
 if (!$or$cond30) {
  _abort();
 }
 $$sum2728 = $2 | 4;
 $7 = $p + $$sum2728 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 $9 = $8 & 1;
 $10 = ($9 | 0) == 0;
 if ($10) {
  _abort();
 }
 $11 = ($5 | 0) == 0;
 if ($11) {
  $12 = $nb >>> 0 < 256;
  if ($12) {
   $newp$0 = 0;
   return $newp$0 | 0;
  }
  $13 = $nb + 4 | 0;
  $14 = $2 >>> 0 < $13 >>> 0;
  if (!$14) {
   $15 = $2 - $nb | 0;
   $16 = HEAP32[856 >> 2] | 0;
   $17 = $16 << 1;
   $18 = $15 >>> 0 > $17 >>> 0;
   if (!$18) {
    $newp$0 = $p;
    return $newp$0 | 0;
   }
  }
  $newp$0 = 0;
  return $newp$0 | 0;
 }
 $19 = $2 >>> 0 < $nb >>> 0;
 if (!$19) {
  $20 = $2 - $nb | 0;
  $21 = $20 >>> 0 > 15;
  if (!$21) {
   $newp$0 = $p;
   return $newp$0 | 0;
  }
  $22 = $p + $nb | 0;
  $23 = $1 & 1;
  $24 = $23 | $nb;
  $25 = $24 | 2;
  HEAP32[$0 >> 2] = $25;
  $$sum23 = $nb + 4 | 0;
  $26 = $p + $$sum23 | 0;
  $27 = $20 | 3;
  HEAP32[$26 >> 2] = $27;
  $28 = HEAP32[$7 >> 2] | 0;
  $29 = $28 | 1;
  HEAP32[$7 >> 2] = $29;
  _dispose_chunk($22, $20);
  $newp$0 = $p;
  return $newp$0 | 0;
 }
 $30 = HEAP32[400 >> 2] | 0;
 $31 = ($3 | 0) == ($30 | 0);
 if ($31) {
  $32 = HEAP32[388 >> 2] | 0;
  $33 = $32 + $2 | 0;
  $34 = $33 >>> 0 > $nb >>> 0;
  if (!$34) {
   $newp$0 = 0;
   return $newp$0 | 0;
  }
  $35 = $33 - $nb | 0;
  $36 = $p + $nb | 0;
  $37 = $1 & 1;
  $38 = $37 | $nb;
  $39 = $38 | 2;
  HEAP32[$0 >> 2] = $39;
  $$sum22 = $nb + 4 | 0;
  $40 = $p + $$sum22 | 0;
  $41 = $35 | 1;
  HEAP32[$40 >> 2] = $41;
  HEAP32[400 >> 2] = $36;
  HEAP32[388 >> 2] = $35;
  $newp$0 = $p;
  return $newp$0 | 0;
 }
 $42 = HEAP32[396 >> 2] | 0;
 $43 = ($3 | 0) == ($42 | 0);
 if ($43) {
  $44 = HEAP32[384 >> 2] | 0;
  $45 = $44 + $2 | 0;
  $46 = $45 >>> 0 < $nb >>> 0;
  if ($46) {
   $newp$0 = 0;
   return $newp$0 | 0;
  }
  $47 = $45 - $nb | 0;
  $48 = $47 >>> 0 > 15;
  if ($48) {
   $49 = $p + $nb | 0;
   $50 = $p + $45 | 0;
   $51 = $1 & 1;
   $52 = $51 | $nb;
   $53 = $52 | 2;
   HEAP32[$0 >> 2] = $53;
   $$sum19 = $nb + 4 | 0;
   $54 = $p + $$sum19 | 0;
   $55 = $47 | 1;
   HEAP32[$54 >> 2] = $55;
   HEAP32[$50 >> 2] = $47;
   $$sum20 = $45 + 4 | 0;
   $56 = $p + $$sum20 | 0;
   $57 = HEAP32[$56 >> 2] | 0;
   $58 = $57 & -2;
   HEAP32[$56 >> 2] = $58;
   $storemerge = $49;
   $storemerge21 = $47;
  } else {
   $59 = $1 & 1;
   $60 = $59 | $45;
   $61 = $60 | 2;
   HEAP32[$0 >> 2] = $61;
   $$sum17 = $45 + 4 | 0;
   $62 = $p + $$sum17 | 0;
   $63 = HEAP32[$62 >> 2] | 0;
   $64 = $63 | 1;
   HEAP32[$62 >> 2] = $64;
   $storemerge = 0;
   $storemerge21 = 0;
  }
  HEAP32[384 >> 2] = $storemerge21;
  HEAP32[396 >> 2] = $storemerge;
  $newp$0 = $p;
  return $newp$0 | 0;
 }
 $65 = $8 & 2;
 $66 = ($65 | 0) == 0;
 if (!$66) {
  $newp$0 = 0;
  return $newp$0 | 0;
 }
 $67 = $8 & -8;
 $68 = $67 + $2 | 0;
 $69 = $68 >>> 0 < $nb >>> 0;
 if ($69) {
  $newp$0 = 0;
  return $newp$0 | 0;
 }
 $70 = $68 - $nb | 0;
 $71 = $8 >>> 3;
 $72 = $8 >>> 0 < 256;
 do {
  if ($72) {
   $$sum15 = $2 + 8 | 0;
   $73 = $p + $$sum15 | 0;
   $74 = HEAP32[$73 >> 2] | 0;
   $$sum16 = $2 + 12 | 0;
   $75 = $p + $$sum16 | 0;
   $76 = HEAP32[$75 >> 2] | 0;
   $77 = $71 << 1;
   $78 = 416 + ($77 << 2) | 0;
   $79 = ($74 | 0) == ($78 | 0);
   if (!$79) {
    $80 = $74 >>> 0 < $4 >>> 0;
    if ($80) {
     _abort();
    }
    $81 = $74 + 12 | 0;
    $82 = HEAP32[$81 >> 2] | 0;
    $83 = ($82 | 0) == ($3 | 0);
    if (!$83) {
     _abort();
    }
   }
   $84 = ($76 | 0) == ($74 | 0);
   if ($84) {
    $85 = 1 << $71;
    $86 = $85 ^ -1;
    $87 = HEAP32[376 >> 2] | 0;
    $88 = $87 & $86;
    HEAP32[376 >> 2] = $88;
    break;
   }
   $89 = ($76 | 0) == ($78 | 0);
   if ($89) {
    $$pre = $76 + 8 | 0;
    $$pre$phiZ2D = $$pre;
   } else {
    $90 = $76 >>> 0 < $4 >>> 0;
    if ($90) {
     _abort();
    }
    $91 = $76 + 8 | 0;
    $92 = HEAP32[$91 >> 2] | 0;
    $93 = ($92 | 0) == ($3 | 0);
    if ($93) {
     $$pre$phiZ2D = $91;
    } else {
     _abort();
    }
   }
   $94 = $74 + 12 | 0;
   HEAP32[$94 >> 2] = $76;
   HEAP32[$$pre$phiZ2D >> 2] = $74;
  } else {
   $$sum = $2 + 24 | 0;
   $95 = $p + $$sum | 0;
   $96 = HEAP32[$95 >> 2] | 0;
   $$sum2 = $2 + 12 | 0;
   $97 = $p + $$sum2 | 0;
   $98 = HEAP32[$97 >> 2] | 0;
   $99 = ($98 | 0) == ($3 | 0);
   do {
    if ($99) {
     $$sum4 = $2 + 20 | 0;
     $109 = $p + $$sum4 | 0;
     $110 = HEAP32[$109 >> 2] | 0;
     $111 = ($110 | 0) == (0 | 0);
     if ($111) {
      $$sum3 = $2 + 16 | 0;
      $112 = $p + $$sum3 | 0;
      $113 = HEAP32[$112 >> 2] | 0;
      $114 = ($113 | 0) == (0 | 0);
      if ($114) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $113;
       $RP$0 = $112;
      }
     } else {
      $R$0 = $110;
      $RP$0 = $109;
     }
     while (1) {
      $115 = $R$0 + 20 | 0;
      $116 = HEAP32[$115 >> 2] | 0;
      $117 = ($116 | 0) == (0 | 0);
      if (!$117) {
       $R$0 = $116;
       $RP$0 = $115;
       continue;
      }
      $118 = $R$0 + 16 | 0;
      $119 = HEAP32[$118 >> 2] | 0;
      $120 = ($119 | 0) == (0 | 0);
      if ($120) {
       $R$0$lcssa = $R$0;
       $RP$0$lcssa = $RP$0;
       break;
      } else {
       $R$0 = $119;
       $RP$0 = $118;
      }
     }
     $121 = $RP$0$lcssa >>> 0 < $4 >>> 0;
     if ($121) {
      _abort();
     } else {
      HEAP32[$RP$0$lcssa >> 2] = 0;
      $R$1 = $R$0$lcssa;
      break;
     }
    } else {
     $$sum14 = $2 + 8 | 0;
     $100 = $p + $$sum14 | 0;
     $101 = HEAP32[$100 >> 2] | 0;
     $102 = $101 >>> 0 < $4 >>> 0;
     if ($102) {
      _abort();
     }
     $103 = $101 + 12 | 0;
     $104 = HEAP32[$103 >> 2] | 0;
     $105 = ($104 | 0) == ($3 | 0);
     if (!$105) {
      _abort();
     }
     $106 = $98 + 8 | 0;
     $107 = HEAP32[$106 >> 2] | 0;
     $108 = ($107 | 0) == ($3 | 0);
     if ($108) {
      HEAP32[$103 >> 2] = $98;
      HEAP32[$106 >> 2] = $101;
      $R$1 = $98;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   $122 = ($96 | 0) == (0 | 0);
   if (!$122) {
    $$sum11 = $2 + 28 | 0;
    $123 = $p + $$sum11 | 0;
    $124 = HEAP32[$123 >> 2] | 0;
    $125 = 680 + ($124 << 2) | 0;
    $126 = HEAP32[$125 >> 2] | 0;
    $127 = ($3 | 0) == ($126 | 0);
    if ($127) {
     HEAP32[$125 >> 2] = $R$1;
     $cond = ($R$1 | 0) == (0 | 0);
     if ($cond) {
      $128 = 1 << $124;
      $129 = $128 ^ -1;
      $130 = HEAP32[380 >> 2] | 0;
      $131 = $130 & $129;
      HEAP32[380 >> 2] = $131;
      break;
     }
    } else {
     $132 = HEAP32[392 >> 2] | 0;
     $133 = $96 >>> 0 < $132 >>> 0;
     if ($133) {
      _abort();
     }
     $134 = $96 + 16 | 0;
     $135 = HEAP32[$134 >> 2] | 0;
     $136 = ($135 | 0) == ($3 | 0);
     if ($136) {
      HEAP32[$134 >> 2] = $R$1;
     } else {
      $137 = $96 + 20 | 0;
      HEAP32[$137 >> 2] = $R$1;
     }
     $138 = ($R$1 | 0) == (0 | 0);
     if ($138) {
      break;
     }
    }
    $139 = HEAP32[392 >> 2] | 0;
    $140 = $R$1 >>> 0 < $139 >>> 0;
    if ($140) {
     _abort();
    }
    $141 = $R$1 + 24 | 0;
    HEAP32[$141 >> 2] = $96;
    $$sum12 = $2 + 16 | 0;
    $142 = $p + $$sum12 | 0;
    $143 = HEAP32[$142 >> 2] | 0;
    $144 = ($143 | 0) == (0 | 0);
    do {
     if (!$144) {
      $145 = $143 >>> 0 < $139 >>> 0;
      if ($145) {
       _abort();
      } else {
       $146 = $R$1 + 16 | 0;
       HEAP32[$146 >> 2] = $143;
       $147 = $143 + 24 | 0;
       HEAP32[$147 >> 2] = $R$1;
       break;
      }
     }
    } while (0);
    $$sum13 = $2 + 20 | 0;
    $148 = $p + $$sum13 | 0;
    $149 = HEAP32[$148 >> 2] | 0;
    $150 = ($149 | 0) == (0 | 0);
    if (!$150) {
     $151 = HEAP32[392 >> 2] | 0;
     $152 = $149 >>> 0 < $151 >>> 0;
     if ($152) {
      _abort();
     } else {
      $153 = $R$1 + 20 | 0;
      HEAP32[$153 >> 2] = $149;
      $154 = $149 + 24 | 0;
      HEAP32[$154 >> 2] = $R$1;
      break;
     }
    }
   }
  }
 } while (0);
 $155 = $70 >>> 0 < 16;
 if ($155) {
  $156 = $1 & 1;
  $157 = $68 | $156;
  $158 = $157 | 2;
  HEAP32[$0 >> 2] = $158;
  $$sum910 = $68 | 4;
  $159 = $p + $$sum910 | 0;
  $160 = HEAP32[$159 >> 2] | 0;
  $161 = $160 | 1;
  HEAP32[$159 >> 2] = $161;
  $newp$0 = $p;
  return $newp$0 | 0;
 } else {
  $162 = $p + $nb | 0;
  $163 = $1 & 1;
  $164 = $163 | $nb;
  $165 = $164 | 2;
  HEAP32[$0 >> 2] = $165;
  $$sum5 = $nb + 4 | 0;
  $166 = $p + $$sum5 | 0;
  $167 = $70 | 3;
  HEAP32[$166 >> 2] = $167;
  $$sum78 = $68 | 4;
  $168 = $p + $$sum78 | 0;
  $169 = HEAP32[$168 >> 2] | 0;
  $170 = $169 | 1;
  HEAP32[$168 >> 2] = $170;
  _dispose_chunk($162, $70);
  $newp$0 = $p;
  return $newp$0 | 0;
 }
 return 0 | 0;
}

function _keccak_pi($A) {
 $A = $A | 0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
 var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0;
 var $96 = 0, $97 = 0, $98 = 0, $99 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $A + 8 | 0;
 $1 = $0;
 $2 = $1;
 $3 = HEAP32[$2 >> 2] | 0;
 $4 = $1 + 4 | 0;
 $5 = $4;
 $6 = HEAP32[$5 >> 2] | 0;
 $7 = $A + 48 | 0;
 $8 = $7;
 $9 = $8;
 $10 = HEAP32[$9 >> 2] | 0;
 $11 = $8 + 4 | 0;
 $12 = $11;
 $13 = HEAP32[$12 >> 2] | 0;
 $14 = $0;
 $15 = $14;
 HEAP32[$15 >> 2] = $10;
 $16 = $14 + 4 | 0;
 $17 = $16;
 HEAP32[$17 >> 2] = $13;
 $18 = $A + 72 | 0;
 $19 = $18;
 $20 = $19;
 $21 = HEAP32[$20 >> 2] | 0;
 $22 = $19 + 4 | 0;
 $23 = $22;
 $24 = HEAP32[$23 >> 2] | 0;
 $25 = $7;
 $26 = $25;
 HEAP32[$26 >> 2] = $21;
 $27 = $25 + 4 | 0;
 $28 = $27;
 HEAP32[$28 >> 2] = $24;
 $29 = $A + 176 | 0;
 $30 = $29;
 $31 = $30;
 $32 = HEAP32[$31 >> 2] | 0;
 $33 = $30 + 4 | 0;
 $34 = $33;
 $35 = HEAP32[$34 >> 2] | 0;
 $36 = $18;
 $37 = $36;
 HEAP32[$37 >> 2] = $32;
 $38 = $36 + 4 | 0;
 $39 = $38;
 HEAP32[$39 >> 2] = $35;
 $40 = $A + 112 | 0;
 $41 = $40;
 $42 = $41;
 $43 = HEAP32[$42 >> 2] | 0;
 $44 = $41 + 4 | 0;
 $45 = $44;
 $46 = HEAP32[$45 >> 2] | 0;
 $47 = $29;
 $48 = $47;
 HEAP32[$48 >> 2] = $43;
 $49 = $47 + 4 | 0;
 $50 = $49;
 HEAP32[$50 >> 2] = $46;
 $51 = $A + 160 | 0;
 $52 = $51;
 $53 = $52;
 $54 = HEAP32[$53 >> 2] | 0;
 $55 = $52 + 4 | 0;
 $56 = $55;
 $57 = HEAP32[$56 >> 2] | 0;
 $58 = $40;
 $59 = $58;
 HEAP32[$59 >> 2] = $54;
 $60 = $58 + 4 | 0;
 $61 = $60;
 HEAP32[$61 >> 2] = $57;
 $62 = $A + 16 | 0;
 $63 = $62;
 $64 = $63;
 $65 = HEAP32[$64 >> 2] | 0;
 $66 = $63 + 4 | 0;
 $67 = $66;
 $68 = HEAP32[$67 >> 2] | 0;
 $69 = $51;
 $70 = $69;
 HEAP32[$70 >> 2] = $65;
 $71 = $69 + 4 | 0;
 $72 = $71;
 HEAP32[$72 >> 2] = $68;
 $73 = $A + 96 | 0;
 $74 = $73;
 $75 = $74;
 $76 = HEAP32[$75 >> 2] | 0;
 $77 = $74 + 4 | 0;
 $78 = $77;
 $79 = HEAP32[$78 >> 2] | 0;
 $80 = $62;
 $81 = $80;
 HEAP32[$81 >> 2] = $76;
 $82 = $80 + 4 | 0;
 $83 = $82;
 HEAP32[$83 >> 2] = $79;
 $84 = $A + 104 | 0;
 $85 = $84;
 $86 = $85;
 $87 = HEAP32[$86 >> 2] | 0;
 $88 = $85 + 4 | 0;
 $89 = $88;
 $90 = HEAP32[$89 >> 2] | 0;
 $91 = $73;
 $92 = $91;
 HEAP32[$92 >> 2] = $87;
 $93 = $91 + 4 | 0;
 $94 = $93;
 HEAP32[$94 >> 2] = $90;
 $95 = $A + 152 | 0;
 $96 = $95;
 $97 = $96;
 $98 = HEAP32[$97 >> 2] | 0;
 $99 = $96 + 4 | 0;
 $100 = $99;
 $101 = HEAP32[$100 >> 2] | 0;
 $102 = $84;
 $103 = $102;
 HEAP32[$103 >> 2] = $98;
 $104 = $102 + 4 | 0;
 $105 = $104;
 HEAP32[$105 >> 2] = $101;
 $106 = $A + 184 | 0;
 $107 = $106;
 $108 = $107;
 $109 = HEAP32[$108 >> 2] | 0;
 $110 = $107 + 4 | 0;
 $111 = $110;
 $112 = HEAP32[$111 >> 2] | 0;
 $113 = $95;
 $114 = $113;
 HEAP32[$114 >> 2] = $109;
 $115 = $113 + 4 | 0;
 $116 = $115;
 HEAP32[$116 >> 2] = $112;
 $117 = $A + 120 | 0;
 $118 = $117;
 $119 = $118;
 $120 = HEAP32[$119 >> 2] | 0;
 $121 = $118 + 4 | 0;
 $122 = $121;
 $123 = HEAP32[$122 >> 2] | 0;
 $124 = $106;
 $125 = $124;
 HEAP32[$125 >> 2] = $120;
 $126 = $124 + 4 | 0;
 $127 = $126;
 HEAP32[$127 >> 2] = $123;
 $128 = $A + 32 | 0;
 $129 = $128;
 $130 = $129;
 $131 = HEAP32[$130 >> 2] | 0;
 $132 = $129 + 4 | 0;
 $133 = $132;
 $134 = HEAP32[$133 >> 2] | 0;
 $135 = $117;
 $136 = $135;
 HEAP32[$136 >> 2] = $131;
 $137 = $135 + 4 | 0;
 $138 = $137;
 HEAP32[$138 >> 2] = $134;
 $139 = $A + 192 | 0;
 $140 = $139;
 $141 = $140;
 $142 = HEAP32[$141 >> 2] | 0;
 $143 = $140 + 4 | 0;
 $144 = $143;
 $145 = HEAP32[$144 >> 2] | 0;
 $146 = $128;
 $147 = $146;
 HEAP32[$147 >> 2] = $142;
 $148 = $146 + 4 | 0;
 $149 = $148;
 HEAP32[$149 >> 2] = $145;
 $150 = $A + 168 | 0;
 $151 = $150;
 $152 = $151;
 $153 = HEAP32[$152 >> 2] | 0;
 $154 = $151 + 4 | 0;
 $155 = $154;
 $156 = HEAP32[$155 >> 2] | 0;
 $157 = $139;
 $158 = $157;
 HEAP32[$158 >> 2] = $153;
 $159 = $157 + 4 | 0;
 $160 = $159;
 HEAP32[$160 >> 2] = $156;
 $161 = $A + 64 | 0;
 $162 = $161;
 $163 = $162;
 $164 = HEAP32[$163 >> 2] | 0;
 $165 = $162 + 4 | 0;
 $166 = $165;
 $167 = HEAP32[$166 >> 2] | 0;
 $168 = $150;
 $169 = $168;
 HEAP32[$169 >> 2] = $164;
 $170 = $168 + 4 | 0;
 $171 = $170;
 HEAP32[$171 >> 2] = $167;
 $172 = $A + 128 | 0;
 $173 = $172;
 $174 = $173;
 $175 = HEAP32[$174 >> 2] | 0;
 $176 = $173 + 4 | 0;
 $177 = $176;
 $178 = HEAP32[$177 >> 2] | 0;
 $179 = $161;
 $180 = $179;
 HEAP32[$180 >> 2] = $175;
 $181 = $179 + 4 | 0;
 $182 = $181;
 HEAP32[$182 >> 2] = $178;
 $183 = $A + 40 | 0;
 $184 = $183;
 $185 = $184;
 $186 = HEAP32[$185 >> 2] | 0;
 $187 = $184 + 4 | 0;
 $188 = $187;
 $189 = HEAP32[$188 >> 2] | 0;
 $190 = $172;
 $191 = $190;
 HEAP32[$191 >> 2] = $186;
 $192 = $190 + 4 | 0;
 $193 = $192;
 HEAP32[$193 >> 2] = $189;
 $194 = $A + 24 | 0;
 $195 = $194;
 $196 = $195;
 $197 = HEAP32[$196 >> 2] | 0;
 $198 = $195 + 4 | 0;
 $199 = $198;
 $200 = HEAP32[$199 >> 2] | 0;
 $201 = $183;
 $202 = $201;
 HEAP32[$202 >> 2] = $197;
 $203 = $201 + 4 | 0;
 $204 = $203;
 HEAP32[$204 >> 2] = $200;
 $205 = $A + 144 | 0;
 $206 = $205;
 $207 = $206;
 $208 = HEAP32[$207 >> 2] | 0;
 $209 = $206 + 4 | 0;
 $210 = $209;
 $211 = HEAP32[$210 >> 2] | 0;
 $212 = $194;
 $213 = $212;
 HEAP32[$213 >> 2] = $208;
 $214 = $212 + 4 | 0;
 $215 = $214;
 HEAP32[$215 >> 2] = $211;
 $216 = $A + 136 | 0;
 $217 = $216;
 $218 = $217;
 $219 = HEAP32[$218 >> 2] | 0;
 $220 = $217 + 4 | 0;
 $221 = $220;
 $222 = HEAP32[$221 >> 2] | 0;
 $223 = $205;
 $224 = $223;
 HEAP32[$224 >> 2] = $219;
 $225 = $223 + 4 | 0;
 $226 = $225;
 HEAP32[$226 >> 2] = $222;
 $227 = $A + 88 | 0;
 $228 = $227;
 $229 = $228;
 $230 = HEAP32[$229 >> 2] | 0;
 $231 = $228 + 4 | 0;
 $232 = $231;
 $233 = HEAP32[$232 >> 2] | 0;
 $234 = $216;
 $235 = $234;
 HEAP32[$235 >> 2] = $230;
 $236 = $234 + 4 | 0;
 $237 = $236;
 HEAP32[$237 >> 2] = $233;
 $238 = $A + 56 | 0;
 $239 = $238;
 $240 = $239;
 $241 = HEAP32[$240 >> 2] | 0;
 $242 = $239 + 4 | 0;
 $243 = $242;
 $244 = HEAP32[$243 >> 2] | 0;
 $245 = $227;
 $246 = $245;
 HEAP32[$246 >> 2] = $241;
 $247 = $245 + 4 | 0;
 $248 = $247;
 HEAP32[$248 >> 2] = $244;
 $249 = $A + 80 | 0;
 $250 = $249;
 $251 = $250;
 $252 = HEAP32[$251 >> 2] | 0;
 $253 = $250 + 4 | 0;
 $254 = $253;
 $255 = HEAP32[$254 >> 2] | 0;
 $256 = $238;
 $257 = $256;
 HEAP32[$257 >> 2] = $252;
 $258 = $256 + 4 | 0;
 $259 = $258;
 HEAP32[$259 >> 2] = $255;
 $260 = $249;
 $261 = $260;
 HEAP32[$261 >> 2] = $3;
 $262 = $260 + 4 | 0;
 $263 = $262;
 HEAP32[$263 >> 2] = $6;
 return;
}

function _keccak_chi($A) {
 $A = $A | 0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $14 = 0;
 var $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $i$01 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $i$01 = 0;
 while (1) {
  $0 = $A + ($i$01 << 3) | 0;
  $1 = $0;
  $2 = $1;
  $3 = HEAP32[$2 >> 2] | 0;
  $4 = $1 + 4 | 0;
  $5 = $4;
  $6 = HEAP32[$5 >> 2] | 0;
  $7 = $i$01 + 1 | 0;
  $8 = $A + ($7 << 3) | 0;
  $9 = $8;
  $10 = $9;
  $11 = HEAP32[$10 >> 2] | 0;
  $12 = $9 + 4 | 0;
  $13 = $12;
  $14 = HEAP32[$13 >> 2] | 0;
  $15 = $11 ^ -1;
  $16 = $14 ^ -1;
  $17 = $i$01 + 2 | 0;
  $18 = $A + ($17 << 3) | 0;
  $19 = $18;
  $20 = $19;
  $21 = HEAP32[$20 >> 2] | 0;
  $22 = $19 + 4 | 0;
  $23 = $22;
  $24 = HEAP32[$23 >> 2] | 0;
  $25 = $21 & $15;
  $26 = $24 & $16;
  $27 = $25 ^ $3;
  $28 = $26 ^ $6;
  $29 = $0;
  $30 = $29;
  HEAP32[$30 >> 2] = $27;
  $31 = $29 + 4 | 0;
  $32 = $31;
  HEAP32[$32 >> 2] = $28;
  $33 = $18;
  $34 = $33;
  $35 = HEAP32[$34 >> 2] | 0;
  $36 = $33 + 4 | 0;
  $37 = $36;
  $38 = HEAP32[$37 >> 2] | 0;
  $39 = $35 ^ -1;
  $40 = $38 ^ -1;
  $41 = $i$01 + 3 | 0;
  $42 = $A + ($41 << 3) | 0;
  $43 = $42;
  $44 = $43;
  $45 = HEAP32[$44 >> 2] | 0;
  $46 = $43 + 4 | 0;
  $47 = $46;
  $48 = HEAP32[$47 >> 2] | 0;
  $49 = $45 & $39;
  $50 = $48 & $40;
  $51 = $8;
  $52 = $51;
  $53 = HEAP32[$52 >> 2] | 0;
  $54 = $51 + 4 | 0;
  $55 = $54;
  $56 = HEAP32[$55 >> 2] | 0;
  $57 = $53 ^ $49;
  $58 = $56 ^ $50;
  $59 = $8;
  $60 = $59;
  HEAP32[$60 >> 2] = $57;
  $61 = $59 + 4 | 0;
  $62 = $61;
  HEAP32[$62 >> 2] = $58;
  $63 = $42;
  $64 = $63;
  $65 = HEAP32[$64 >> 2] | 0;
  $66 = $63 + 4 | 0;
  $67 = $66;
  $68 = HEAP32[$67 >> 2] | 0;
  $69 = $65 ^ -1;
  $70 = $68 ^ -1;
  $71 = $i$01 + 4 | 0;
  $72 = $A + ($71 << 3) | 0;
  $73 = $72;
  $74 = $73;
  $75 = HEAP32[$74 >> 2] | 0;
  $76 = $73 + 4 | 0;
  $77 = $76;
  $78 = HEAP32[$77 >> 2] | 0;
  $79 = $75 & $69;
  $80 = $78 & $70;
  $81 = $18;
  $82 = $81;
  $83 = HEAP32[$82 >> 2] | 0;
  $84 = $81 + 4 | 0;
  $85 = $84;
  $86 = HEAP32[$85 >> 2] | 0;
  $87 = $83 ^ $79;
  $88 = $86 ^ $80;
  $89 = $18;
  $90 = $89;
  HEAP32[$90 >> 2] = $87;
  $91 = $89 + 4 | 0;
  $92 = $91;
  HEAP32[$92 >> 2] = $88;
  $93 = $72;
  $94 = $93;
  $95 = HEAP32[$94 >> 2] | 0;
  $96 = $93 + 4 | 0;
  $97 = $96;
  $98 = HEAP32[$97 >> 2] | 0;
  $99 = $95 ^ -1;
  $100 = $98 ^ -1;
  $101 = $3 & $99;
  $102 = $6 & $100;
  $103 = $42;
  $104 = $103;
  $105 = HEAP32[$104 >> 2] | 0;
  $106 = $103 + 4 | 0;
  $107 = $106;
  $108 = HEAP32[$107 >> 2] | 0;
  $109 = $105 ^ $101;
  $110 = $108 ^ $102;
  $111 = $42;
  $112 = $111;
  HEAP32[$112 >> 2] = $109;
  $113 = $111 + 4 | 0;
  $114 = $113;
  HEAP32[$114 >> 2] = $110;
  $115 = $3 ^ -1;
  $116 = $6 ^ -1;
  $117 = $11 & $115;
  $118 = $14 & $116;
  $119 = $72;
  $120 = $119;
  $121 = HEAP32[$120 >> 2] | 0;
  $122 = $119 + 4 | 0;
  $123 = $122;
  $124 = HEAP32[$123 >> 2] | 0;
  $125 = $121 ^ $117;
  $126 = $124 ^ $118;
  $127 = $72;
  $128 = $127;
  HEAP32[$128 >> 2] = $125;
  $129 = $127 + 4 | 0;
  $130 = $129;
  HEAP32[$130 >> 2] = $126;
  $131 = $i$01 + 5 | 0;
  $132 = ($131 | 0) < 25;
  if ($132) {
   $i$01 = $131;
  } else {
   break;
  }
 }
 return;
}

function ___stdio_write($f, $buf, $len) {
 $f = $f | 0;
 $buf = $buf | 0;
 $len = $len | 0;
 var $$0 = 0, $$phi$trans$insert = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $cnt$0 = 0, $cnt$1 = 0, $iov$0 = 0, $iov$0$lcssa11 = 0, $iov$1 = 0, $iovcnt$0 = 0;
 var $iovcnt$0$lcssa12 = 0, $iovcnt$1 = 0, $iovs = 0, $rem$0 = 0, $vararg_buffer = 0, $vararg_buffer3 = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr6 = 0, $vararg_ptr7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $vararg_buffer3 = sp + 16 | 0;
 $vararg_buffer = sp;
 $iovs = sp + 32 | 0;
 $0 = $f + 28 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 HEAP32[$iovs >> 2] = $1;
 $2 = $iovs + 4 | 0;
 $3 = $f + 20 | 0;
 $4 = HEAP32[$3 >> 2] | 0;
 $5 = $4;
 $6 = $5 - $1 | 0;
 HEAP32[$2 >> 2] = $6;
 $7 = $iovs + 8 | 0;
 HEAP32[$7 >> 2] = $buf;
 $8 = $iovs + 12 | 0;
 HEAP32[$8 >> 2] = $len;
 $9 = $6 + $len | 0;
 $10 = $f + 60 | 0;
 $11 = $f + 44 | 0;
 $iov$0 = $iovs;
 $iovcnt$0 = 2;
 $rem$0 = $9;
 while (1) {
  $12 = HEAP32[212 >> 2] | 0;
  $13 = ($12 | 0) == (0 | 0);
  if ($13) {
   $17 = HEAP32[$10 >> 2] | 0;
   HEAP32[$vararg_buffer3 >> 2] = $17;
   $vararg_ptr6 = $vararg_buffer3 + 4 | 0;
   HEAP32[$vararg_ptr6 >> 2] = $iov$0;
   $vararg_ptr7 = $vararg_buffer3 + 8 | 0;
   HEAP32[$vararg_ptr7 >> 2] = $iovcnt$0;
   $18 = ___syscall146(146, $vararg_buffer3 | 0) | 0;
   $19 = ___syscall_ret($18) | 0;
   $cnt$0 = $19;
  } else {
   _pthread_cleanup_push(1 | 0, $f | 0);
   $14 = HEAP32[$10 >> 2] | 0;
   HEAP32[$vararg_buffer >> 2] = $14;
   $vararg_ptr1 = $vararg_buffer + 4 | 0;
   HEAP32[$vararg_ptr1 >> 2] = $iov$0;
   $vararg_ptr2 = $vararg_buffer + 8 | 0;
   HEAP32[$vararg_ptr2 >> 2] = $iovcnt$0;
   $15 = ___syscall146(146, $vararg_buffer | 0) | 0;
   $16 = ___syscall_ret($15) | 0;
   _pthread_cleanup_pop(0);
   $cnt$0 = $16;
  }
  $20 = ($rem$0 | 0) == ($cnt$0 | 0);
  if ($20) {
   label = 6;
   break;
  }
  $27 = ($cnt$0 | 0) < 0;
  if ($27) {
   $iov$0$lcssa11 = $iov$0;
   $iovcnt$0$lcssa12 = $iovcnt$0;
   label = 8;
   break;
  }
  $35 = $rem$0 - $cnt$0 | 0;
  $36 = $iov$0 + 4 | 0;
  $37 = HEAP32[$36 >> 2] | 0;
  $38 = $cnt$0 >>> 0 > $37 >>> 0;
  if ($38) {
   $39 = HEAP32[$11 >> 2] | 0;
   HEAP32[$0 >> 2] = $39;
   HEAP32[$3 >> 2] = $39;
   $40 = $cnt$0 - $37 | 0;
   $41 = $iov$0 + 8 | 0;
   $42 = $iovcnt$0 + -1 | 0;
   $$phi$trans$insert = $iov$0 + 12 | 0;
   $$pre = HEAP32[$$phi$trans$insert >> 2] | 0;
   $50 = $$pre;
   $cnt$1 = $40;
   $iov$1 = $41;
   $iovcnt$1 = $42;
  } else {
   $43 = ($iovcnt$0 | 0) == 2;
   if ($43) {
    $44 = HEAP32[$0 >> 2] | 0;
    $45 = $44 + $cnt$0 | 0;
    HEAP32[$0 >> 2] = $45;
    $50 = $37;
    $cnt$1 = $cnt$0;
    $iov$1 = $iov$0;
    $iovcnt$1 = 2;
   } else {
    $50 = $37;
    $cnt$1 = $cnt$0;
    $iov$1 = $iov$0;
    $iovcnt$1 = $iovcnt$0;
   }
  }
  $46 = HEAP32[$iov$1 >> 2] | 0;
  $47 = $46 + $cnt$1 | 0;
  HEAP32[$iov$1 >> 2] = $47;
  $48 = $iov$1 + 4 | 0;
  $49 = $50 - $cnt$1 | 0;
  HEAP32[$48 >> 2] = $49;
  $iov$0 = $iov$1;
  $iovcnt$0 = $iovcnt$1;
  $rem$0 = $35;
 }
 if ((label | 0) == 6) {
  $21 = HEAP32[$11 >> 2] | 0;
  $22 = $f + 48 | 0;
  $23 = HEAP32[$22 >> 2] | 0;
  $24 = $21 + $23 | 0;
  $25 = $f + 16 | 0;
  HEAP32[$25 >> 2] = $24;
  $26 = $21;
  HEAP32[$0 >> 2] = $26;
  HEAP32[$3 >> 2] = $26;
  $$0 = $len;
 } else if ((label | 0) == 8) {
  $28 = $f + 16 | 0;
  HEAP32[$28 >> 2] = 0;
  HEAP32[$0 >> 2] = 0;
  HEAP32[$3 >> 2] = 0;
  $29 = HEAP32[$f >> 2] | 0;
  $30 = $29 | 32;
  HEAP32[$f >> 2] = $30;
  $31 = ($iovcnt$0$lcssa12 | 0) == 2;
  if ($31) {
   $$0 = 0;
  } else {
   $32 = $iov$0$lcssa11 + 4 | 0;
   $33 = HEAP32[$32 >> 2] | 0;
   $34 = $len - $33 | 0;
   $$0 = $34;
  }
 }
 STACKTOP = sp;
 return $$0 | 0;
}

function _base64_encode($data, $input_length, $output_length) {
 $data = $data | 0;
 $input_length = $input_length | 0;
 $output_length = $output_length | 0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i$02 = 0, $i$2 = 0, $i$3 = 0, $j$01 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $input_length + 2 | 0;
 $1 = ($0 >>> 0) / 3 & -1;
 $2 = $1 << 2;
 $3 = ($input_length >>> 0) % 3 & -1;
 $4 = 200 + ($3 << 2) | 0;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = $2 - $5 | 0;
 HEAP32[$output_length >> 2] = $6;
 $7 = _malloc($6) | 0;
 $8 = ($7 | 0) == (0 | 0);
 if ($8) {
  $$0 = 0;
  return $$0 | 0;
 }
 $9 = ($input_length | 0) == 0;
 if ($9) {
  $$0 = $7;
  return $$0 | 0;
 } else {
  $i$02 = 0;
  $j$01 = 0;
 }
 while (1) {
  $10 = $i$02 + 1 | 0;
  $11 = $data + $i$02 | 0;
  $12 = HEAP8[$11 >> 0] | 0;
  $13 = $12 & 255;
  $14 = $10 >>> 0 < $input_length >>> 0;
  if ($14) {
   $15 = $i$02 + 2 | 0;
   $16 = $data + $10 | 0;
   $17 = HEAP8[$16 >> 0] | 0;
   $18 = $17 & 255;
   $26 = $18;
   $i$2 = $15;
  } else {
   $26 = 0;
   $i$2 = $10;
  }
  $19 = $i$2 >>> 0 < $input_length >>> 0;
  if ($19) {
   $20 = $i$2 + 1 | 0;
   $21 = $data + $i$2 | 0;
   $22 = HEAP8[$21 >> 0] | 0;
   $23 = $22 & 255;
   $29 = $23;
   $i$3 = $20;
  } else {
   $29 = 0;
   $i$3 = $i$2;
  }
  $24 = $13 << 16;
  $25 = $26 << 8;
  $27 = $25 | $24;
  $28 = $29 | $25;
  $30 = $13 >>> 2;
  $31 = 872 + $30 | 0;
  $32 = HEAP8[$31 >> 0] | 0;
  $33 = $j$01 | 1;
  $34 = $7 + $j$01 | 0;
  HEAP8[$34 >> 0] = $32;
  $35 = $27 >>> 12;
  $36 = $35 & 63;
  $37 = 872 + $36 | 0;
  $38 = HEAP8[$37 >> 0] | 0;
  $39 = $j$01 | 2;
  $40 = $7 + $33 | 0;
  HEAP8[$40 >> 0] = $38;
  $41 = $28 >>> 6;
  $42 = $41 & 63;
  $43 = 872 + $42 | 0;
  $44 = HEAP8[$43 >> 0] | 0;
  $45 = $j$01 | 3;
  $46 = $7 + $39 | 0;
  HEAP8[$46 >> 0] = $44;
  $47 = $29 & 63;
  $48 = 872 + $47 | 0;
  $49 = HEAP8[$48 >> 0] | 0;
  $50 = $j$01 + 4 | 0;
  $51 = $7 + $45 | 0;
  HEAP8[$51 >> 0] = $49;
  $52 = $i$3 >>> 0 < $input_length >>> 0;
  if ($52) {
   $i$02 = $i$3;
   $j$01 = $50;
  } else {
   $$0 = $7;
   break;
  }
 }
 return $$0 | 0;
}

function _fflush($f) {
 $f = $f | 0;
 var $$0 = 0, $$01 = 0, $$012 = 0, $$014 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phitmp = 0, $r$0$lcssa = 0, $r$03 = 0, $r$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($f | 0) == (0 | 0);
 do {
  if ($0) {
   $7 = HEAP32[256 >> 2] | 0;
   $8 = ($7 | 0) == (0 | 0);
   if ($8) {
    $27 = 0;
   } else {
    $9 = HEAP32[256 >> 2] | 0;
    $10 = _fflush($9) | 0;
    $27 = $10;
   }
   ___lock(240 | 0);
   $$012 = HEAP32[236 >> 2] | 0;
   $11 = ($$012 | 0) == (0 | 0);
   if ($11) {
    $r$0$lcssa = $27;
   } else {
    $$014 = $$012;
    $r$03 = $27;
    while (1) {
     $12 = $$014 + 76 | 0;
     $13 = HEAP32[$12 >> 2] | 0;
     $14 = ($13 | 0) > -1;
     if ($14) {
      $15 = ___lockfile($$014) | 0;
      $24 = $15;
     } else {
      $24 = 0;
     }
     $16 = $$014 + 20 | 0;
     $17 = HEAP32[$16 >> 2] | 0;
     $18 = $$014 + 28 | 0;
     $19 = HEAP32[$18 >> 2] | 0;
     $20 = $17 >>> 0 > $19 >>> 0;
     if ($20) {
      $21 = ___fflush_unlocked($$014) | 0;
      $22 = $21 | $r$03;
      $r$1 = $22;
     } else {
      $r$1 = $r$03;
     }
     $23 = ($24 | 0) == 0;
     if (!$23) {
      ___unlockfile($$014);
     }
     $25 = $$014 + 56 | 0;
     $$01 = HEAP32[$25 >> 2] | 0;
     $26 = ($$01 | 0) == (0 | 0);
     if ($26) {
      $r$0$lcssa = $r$1;
      break;
     } else {
      $$014 = $$01;
      $r$03 = $r$1;
     }
    }
   }
   ___unlock(240 | 0);
   $$0 = $r$0$lcssa;
  } else {
   $1 = $f + 76 | 0;
   $2 = HEAP32[$1 >> 2] | 0;
   $3 = ($2 | 0) > -1;
   if (!$3) {
    $4 = ___fflush_unlocked($f) | 0;
    $$0 = $4;
    break;
   }
   $5 = ___lockfile($f) | 0;
   $phitmp = ($5 | 0) == 0;
   $6 = ___fflush_unlocked($f) | 0;
   if ($phitmp) {
    $$0 = $6;
   } else {
    ___unlockfile($f);
    $$0 = $6;
   }
  }
 } while (0);
 return $$0 | 0;
}

function _rhash_sha3_update($ctx, $msg, $size) {
 $ctx = $ctx | 0;
 $msg = $msg | 0;
 $size = $size | 0;
 var $$0$lcssa = 0, $$0$ph = 0, $$01$lcssa = 0, $$01$ph = 0, $$012 = 0, $$03 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $aligned_message_block$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $ctx + 392 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 $2 = $ctx + 396 | 0;
 $3 = HEAP32[$2 >> 2] | 0;
 $4 = ($1 | 0) < 0;
 if ($4) {
  return;
 }
 $5 = $1 + $size | 0;
 $6 = ($5 >>> 0) % ($3 >>> 0) & -1;
 HEAP32[$0 >> 2] = $6;
 $7 = ($1 | 0) == 0;
 do {
  if ($7) {
   $$0$ph = $msg;
   $$01$ph = $size;
  } else {
   $8 = $3 - $1 | 0;
   $9 = $ctx + 200 | 0;
   $10 = $9 + $1 | 0;
   $11 = $8 >>> 0 > $size >>> 0;
   $12 = $11 ? $size : $8;
   _memcpy($10 | 0, $msg | 0, $12 | 0) | 0;
   if ($11) {
    return;
   } else {
    _rhash_sha3_process_block($ctx, $9, $3);
    $13 = $msg + $8 | 0;
    $14 = $size - $8 | 0;
    $$0$ph = $13;
    $$01$ph = $14;
    break;
   }
  }
 } while (0);
 $15 = $$01$ph >>> 0 < $3 >>> 0;
 if ($15) {
  $$0$lcssa = $$0$ph;
  $$01$lcssa = $$01$ph;
 } else {
  $16 = $ctx + 200 | 0;
  $$012 = $$01$ph;
  $$03 = $$0$ph;
  while (1) {
   $17 = $$03;
   $18 = $17 & 7;
   $19 = ($18 | 0) == 0;
   if ($19) {
    $aligned_message_block$0 = $$03;
   } else {
    _memcpy($16 | 0, $$03 | 0, $3 | 0) | 0;
    $aligned_message_block$0 = $16;
   }
   _rhash_sha3_process_block($ctx, $aligned_message_block$0, $3);
   $20 = $$03 + $3 | 0;
   $21 = $$012 - $3 | 0;
   $22 = $21 >>> 0 < $3 >>> 0;
   if ($22) {
    $$0$lcssa = $20;
    $$01$lcssa = $21;
    break;
   } else {
    $$012 = $21;
    $$03 = $20;
   }
  }
 }
 $23 = ($$01$lcssa | 0) == 0;
 if ($23) {
  return;
 }
 $24 = $ctx + 200 | 0;
 _memcpy($24 | 0, $$0$lcssa | 0, $$01$lcssa | 0) | 0;
 return;
}

function _realloc($oldmem, $bytes) {
 $oldmem = $oldmem | 0;
 $bytes = $bytes | 0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $mem$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($oldmem | 0) == (0 | 0);
 if ($0) {
  $1 = _malloc($bytes) | 0;
  $mem$0 = $1;
  return $mem$0 | 0;
 }
 $2 = $bytes >>> 0 > 4294967231;
 if ($2) {
  $3 = ___errno_location() | 0;
  HEAP32[$3 >> 2] = 12;
  $mem$0 = 0;
  return $mem$0 | 0;
 }
 $4 = $bytes >>> 0 < 11;
 $5 = $bytes + 11 | 0;
 $6 = $5 & -8;
 $7 = $4 ? 16 : $6;
 $8 = $oldmem + -8 | 0;
 $9 = _try_realloc_chunk($8, $7) | 0;
 $10 = ($9 | 0) == (0 | 0);
 if (!$10) {
  $11 = $9 + 8 | 0;
  $mem$0 = $11;
  return $mem$0 | 0;
 }
 $12 = _malloc($bytes) | 0;
 $13 = ($12 | 0) == (0 | 0);
 if ($13) {
  $mem$0 = 0;
  return $mem$0 | 0;
 }
 $14 = $oldmem + -4 | 0;
 $15 = HEAP32[$14 >> 2] | 0;
 $16 = $15 & -8;
 $17 = $15 & 3;
 $18 = ($17 | 0) == 0;
 $19 = $18 ? 8 : 4;
 $20 = $16 - $19 | 0;
 $21 = $20 >>> 0 < $bytes >>> 0;
 $22 = $21 ? $20 : $bytes;
 _memcpy($12 | 0, $oldmem | 0, $22 | 0) | 0;
 _free($oldmem);
 $mem$0 = $12;
 return $mem$0 | 0;
}

function _rhash_sha3_final($ctx, $result) {
 $ctx = $ctx | 0;
 $result = $result | 0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $ctx + 396 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 $2 = $1 >>> 1;
 $3 = 100 - $2 | 0;
 $4 = $ctx + 392 | 0;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = ($5 | 0) < 0;
 if (!$6) {
  $7 = $ctx + 200 | 0;
  $8 = $7 + $5 | 0;
  $9 = $1 - $5 | 0;
  _memset($8 | 0, 0, $9 | 0) | 0;
  $10 = HEAP32[$4 >> 2] | 0;
  $11 = $7 + $10 | 0;
  $12 = HEAP8[$11 >> 0] | 0;
  $13 = $12 & 255;
  $14 = $13 | 1;
  $15 = $14 & 255;
  HEAP8[$11 >> 0] = $15;
  $16 = $1 + -1 | 0;
  $17 = $7 + $16 | 0;
  $18 = HEAP8[$17 >> 0] | 0;
  $19 = $18 & 255;
  $20 = $19 | 128;
  $21 = $20 & 255;
  HEAP8[$17 >> 0] = $21;
  _rhash_sha3_process_block($ctx, $7, $1);
  HEAP32[$4 >> 2] = -2147483648;
 }
 $22 = $1 >>> 0 > $3 >>> 0;
 if (!$22) {
  ___assert_fail(936 | 0, 963 | 0, 306, 979 | 0);
 }
 $23 = ($result | 0) == (0 | 0);
 if ($23) {
  return;
 }
 _memcpy($result | 0, $ctx | 0, $3 | 0) | 0;
 return;
}

function ___fflush_unlocked($f) {
 $f = $f | 0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $f + 20 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 $2 = $f + 28 | 0;
 $3 = HEAP32[$2 >> 2] | 0;
 $4 = $1 >>> 0 > $3 >>> 0;
 if ($4) {
  $5 = $f + 36 | 0;
  $6 = HEAP32[$5 >> 2] | 0;
  FUNCTION_TABLE_iiii[$6 & 3]($f, 0, 0) | 0;
  $7 = HEAP32[$0 >> 2] | 0;
  $8 = ($7 | 0) == (0 | 0);
  if ($8) {
   $$0 = -1;
  } else {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label | 0) == 3) {
  $9 = $f + 4 | 0;
  $10 = HEAP32[$9 >> 2] | 0;
  $11 = $f + 8 | 0;
  $12 = HEAP32[$11 >> 2] | 0;
  $13 = $10 >>> 0 < $12 >>> 0;
  if ($13) {
   $14 = $f + 40 | 0;
   $15 = HEAP32[$14 >> 2] | 0;
   $16 = $10;
   $17 = $12;
   $18 = $16 - $17 | 0;
   FUNCTION_TABLE_iiii[$15 & 3]($f, $18, 1) | 0;
  }
  $19 = $f + 16 | 0;
  HEAP32[$19 >> 2] = 0;
  HEAP32[$2 >> 2] = 0;
  HEAP32[$0 >> 2] = 0;
  HEAP32[$11 >> 2] = 0;
  HEAP32[$9 >> 2] = 0;
  $$0 = 0;
 }
 return $$0 | 0;
}

function _pixelsToHashCode($pixels, $length) {
 $pixels = $pixels | 0;
 $length = $length | 0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $b64length = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $b64length = sp;
 $0 = _malloc(96) | 0;
 $1 = _hashSha512($pixels, $length) | 0;
 dest = $0;
 src = $1;
 stop = dest + 64 | 0;
 do {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 } while ((dest | 0) < (stop | 0));
 _free($1);
 $2 = _hashSha256($pixels, $length) | 0;
 $3 = $0 + 64 | 0;
 dest = $3;
 src = $2;
 stop = dest + 32 | 0;
 do {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 } while ((dest | 0) < (stop | 0));
 _free($2);
 $4 = _base64_encode($0, 96, $b64length) | 0;
 $5 = HEAP32[$b64length >> 2] | 0;
 $6 = $5 + 1 | 0;
 $7 = _realloc($4, $6) | 0;
 $8 = HEAP32[$b64length >> 2] | 0;
 $9 = $7 + $8 | 0;
 HEAP8[$9 >> 0] = 0;
 _free($0);
 STACKTOP = sp;
 return $7 | 0;
}

function ___stdio_seek($f, $off, $whence) {
 $f = $f | 0;
 $off = $off | 0;
 $whence = $whence | 0;
 var $$pre = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $ret = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $vararg_buffer = sp;
 $ret = sp + 20 | 0;
 $0 = $f + 60 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 HEAP32[$vararg_buffer >> 2] = $1;
 $vararg_ptr1 = $vararg_buffer + 4 | 0;
 HEAP32[$vararg_ptr1 >> 2] = 0;
 $vararg_ptr2 = $vararg_buffer + 8 | 0;
 HEAP32[$vararg_ptr2 >> 2] = $off;
 $vararg_ptr3 = $vararg_buffer + 12 | 0;
 HEAP32[$vararg_ptr3 >> 2] = $ret;
 $vararg_ptr4 = $vararg_buffer + 16 | 0;
 HEAP32[$vararg_ptr4 >> 2] = $whence;
 $2 = ___syscall140(140, $vararg_buffer | 0) | 0;
 $3 = ___syscall_ret($2) | 0;
 $4 = ($3 | 0) < 0;
 if ($4) {
  HEAP32[$ret >> 2] = -1;
  $5 = -1;
 } else {
  $$pre = HEAP32[$ret >> 2] | 0;
  $5 = $$pre;
 }
 STACKTOP = sp;
 return $5 | 0;
}

function ___stdout_write($f, $buf, $len) {
 $f = $f | 0;
 $buf = $buf | 0;
 $len = $len | 0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $tio = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80 | 0;
 $vararg_buffer = sp;
 $tio = sp + 12 | 0;
 $0 = $f + 36 | 0;
 HEAP32[$0 >> 2] = 3;
 $1 = HEAP32[$f >> 2] | 0;
 $2 = $1 & 64;
 $3 = ($2 | 0) == 0;
 if ($3) {
  $4 = $f + 60 | 0;
  $5 = HEAP32[$4 >> 2] | 0;
  HEAP32[$vararg_buffer >> 2] = $5;
  $vararg_ptr1 = $vararg_buffer + 4 | 0;
  HEAP32[$vararg_ptr1 >> 2] = 21505;
  $vararg_ptr2 = $vararg_buffer + 8 | 0;
  HEAP32[$vararg_ptr2 >> 2] = $tio;
  $6 = ___syscall54(54, $vararg_buffer | 0) | 0;
  $7 = ($6 | 0) == 0;
  if (!$7) {
   $8 = $f + 75 | 0;
   HEAP8[$8 >> 0] = -1;
  }
 }
 $9 = ___stdio_write($f, $buf, $len) | 0;
 STACKTOP = sp;
 return $9 | 0;
}

function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 if ((num | 0) >= 4096) return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 ret = dest | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  while ((num | 0) >= 4) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
   num = num - 4 | 0;
  }
 }
 while ((num | 0) > 0) {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
  num = num - 1 | 0;
 }
 return ret | 0;
}

function runPostSets() {}
function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
 stop = ptr + num | 0;
 if ((num | 0) >= 20) {
  value = value & 255;
  unaligned = ptr & 3;
  value4 = value | value << 8 | value << 16 | value << 24;
  stop4 = stop & ~3;
  if (unaligned) {
   unaligned = ptr + 4 - unaligned | 0;
   while ((ptr | 0) < (unaligned | 0)) {
    HEAP8[ptr >> 0] = value;
    ptr = ptr + 1 | 0;
   }
  }
  while ((ptr | 0) < (stop4 | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (stop | 0)) {
  HEAP8[ptr >> 0] = value;
  ptr = ptr + 1 | 0;
 }
 return ptr - num | 0;
}

function _rhash_keccak_init($ctx, $bits) {
 $ctx = $ctx | 0;
 $bits = $bits | 0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $or$cond = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $bits << 1;
 $1 = 1600 - $0 | 0;
 _memset($ctx | 0, 0, 400) | 0;
 $2 = $1 >>> 3;
 $3 = $ctx + 396 | 0;
 HEAP32[$3 >> 2] = $2;
 $4 = $1 >>> 0 < 1601;
 $5 = $1 & 62;
 $6 = ($5 | 0) == 0;
 $or$cond = $4 & $6;
 if ($or$cond) {
  return;
 } else {
  ___assert_fail(996 | 0, 963 | 0, 45, 1029 | 0);
 }
}

function copyTempDouble(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr >> 0] = HEAP8[ptr >> 0];
 HEAP8[tempDoublePtr + 1 >> 0] = HEAP8[ptr + 1 >> 0];
 HEAP8[tempDoublePtr + 2 >> 0] = HEAP8[ptr + 2 >> 0];
 HEAP8[tempDoublePtr + 3 >> 0] = HEAP8[ptr + 3 >> 0];
 HEAP8[tempDoublePtr + 4 >> 0] = HEAP8[ptr + 4 >> 0];
 HEAP8[tempDoublePtr + 5 >> 0] = HEAP8[ptr + 5 >> 0];
 HEAP8[tempDoublePtr + 6 >> 0] = HEAP8[ptr + 6 >> 0];
 HEAP8[tempDoublePtr + 7 >> 0] = HEAP8[ptr + 7 >> 0];
}

function ___stdio_close($f) {
 $f = $f | 0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $vararg_buffer = sp;
 $0 = $f + 60 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 HEAP32[$vararg_buffer >> 2] = $1;
 $2 = ___syscall6(6, $vararg_buffer | 0) | 0;
 $3 = ___syscall_ret($2) | 0;
 STACKTOP = sp;
 return $3 | 0;
}

function _hashSha512($msg, $length) {
 $msg = $msg | 0;
 $length = $length | 0;
 var $0 = 0, $sha = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 400 | 0;
 $sha = sp;
 _rhash_sha3_512_init($sha);
 _rhash_sha3_update($sha, $msg, $length);
 $0 = _malloc(64) | 0;
 _rhash_sha3_final($sha, $0);
 STACKTOP = sp;
 return $0 | 0;
}

function _hashSha256($msg, $length) {
 $msg = $msg | 0;
 $length = $length | 0;
 var $0 = 0, $sha = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 400 | 0;
 $sha = sp;
 _rhash_sha3_256_init($sha);
 _rhash_sha3_update($sha, $msg, $length);
 $0 = _malloc(32) | 0;
 _rhash_sha3_final($sha, $0);
 STACKTOP = sp;
 return $0 | 0;
}

function ___errno_location() {
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[212 >> 2] | 0;
 $1 = ($0 | 0) == (0 | 0);
 if ($1) {
  $$0 = 260;
 } else {
  $2 = _pthread_self() | 0;
  $3 = $2 + 60 | 0;
  $4 = HEAP32[$3 >> 2] | 0;
  $$0 = $4;
 }
 return $$0 | 0;
}

function _bitshift64Shl(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  tempRet0 = high << bits | (low & ander << 32 - bits) >>> 32 - bits;
  return low << bits;
 }
 tempRet0 = low << bits - 32;
 return 0;
}

function _bitshift64Lshr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  tempRet0 = high >>> bits;
  return low >>> bits | (high & ander) << 32 - bits;
 }
 tempRet0 = 0;
 return high >>> bits - 32 | 0;
}

function ___syscall_ret($r) {
 $r = $r | 0;
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $r >>> 0 > 4294963200;
 if ($0) {
  $1 = 0 - $r | 0;
  $2 = ___errno_location() | 0;
  HEAP32[$2 >> 2] = $1;
  $$0 = -1;
 } else {
  $$0 = $r;
 }
 return $$0 | 0;
}

function copyTempFloat(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr >> 0] = HEAP8[ptr >> 0];
 HEAP8[tempDoublePtr + 1 >> 0] = HEAP8[ptr + 1 >> 0];
 HEAP8[tempDoublePtr + 2 >> 0] = HEAP8[ptr + 2 >> 0];
 HEAP8[tempDoublePtr + 3 >> 0] = HEAP8[ptr + 3 >> 0];
}

function _cleanup392($p) {
 $p = $p | 0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $p + 68 | 0;
 $1 = HEAP32[$0 >> 2] | 0;
 $2 = ($1 | 0) == 0;
 if ($2) {
  ___unlockfile($p);
 }
 return;
}

function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[index & 3](a1 | 0, a2 | 0, a3 | 0) | 0;
}
function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 15 & -16;
 return ret | 0;
}

function establishStackSpace(stackBase, stackMax) {
 stackBase = stackBase | 0;
 stackMax = stackMax | 0;
 STACKTOP = stackBase;
 STACK_MAX = stackMax;
}

function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}

function _rhash_sha3_512_init($ctx) {
 $ctx = $ctx | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _rhash_keccak_init($ctx, 512);
 return;
}

function _rhash_sha3_256_init($ctx) {
 $ctx = $ctx | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _rhash_keccak_init($ctx, 256);
 return;
}

function dynCall_ii(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 return FUNCTION_TABLE_ii[index & 1](a1 | 0) | 0;
}

function dynCall_vi(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 FUNCTION_TABLE_vi[index & 1](a1 | 0);
}

function ___unlockfile($f) {
 $f = $f | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}

function ___lockfile($f) {
 $f = $f | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 0;
}

function b1(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 abort(1);
 return 0;
}

function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}

function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}

function b0(p0) {
 p0 = p0 | 0;
 abort(0);
 return 0;
}

function getTempRet0() {
 return tempRet0 | 0;
}

function stackSave() {
 return STACKTOP | 0;
}

function b2(p0) {
 p0 = p0 | 0;
 abort(2);
}

// EMSCRIPTEN_END_FUNCS
var FUNCTION_TABLE_ii = [b0,___stdio_close];
var FUNCTION_TABLE_iiii = [b1,___stdout_write,___stdio_seek,___stdio_write];
var FUNCTION_TABLE_vi = [b2,_cleanup392];

  return { _pixelsToHashCode: _pixelsToHashCode, _fflush: _fflush, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _bitshift64Lshr: _bitshift64Lshr, _free: _free, ___errno_location: ___errno_location, _bitshift64Shl: _bitshift64Shl, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, establishStackSpace: establishStackSpace, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, dynCall_ii: dynCall_ii, dynCall_iiii: dynCall_iiii, dynCall_vi: dynCall_vi };
})
// EMSCRIPTEN_END_ASM
(e.Ya, e.Za, buffer);
e._pixelsToHashCode = Z._pixelsToHashCode;
e._fflush = Z._fflush;
e.runPostSets = Z.runPostSets;
var kb = e._memset = Z._memset, Da = e._malloc = Z._malloc, pc = e._memcpy = Z._memcpy, mb = e._bitshift64Lshr = Z._bitshift64Lshr, Ma = e._free = Z._free;
e.___errno_location = Z.___errno_location;
var nb = e._bitshift64Shl = Z._bitshift64Shl;
e.dynCall_ii = Z.dynCall_ii;
e.dynCall_iiii = Z.dynCall_iiii;
e.dynCall_vi = Z.dynCall_vi;
n.aa = Z.stackAlloc;
n.ua = Z.stackSave;
n.ba = Z.stackRestore;
n.Bd = Z.establishStackSpace;
n.rb = Z.setTempRet0;
n.fb = Z.getTempRet0;
function ia(a) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + a + ")";
  this.status = a;
}
ia.prototype = Error();
ia.prototype.constructor = ia;
var ed = null, fb = function fd() {
  e.calledRun || gd();
  e.calledRun || (fb = fd);
};
e.callMain = e.yd = function(a) {
  function b() {
    for (var a = 0;3 > a;a++) {
      d.push(0);
    }
  }
  assert(0 == I, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
  assert(0 == Ya.length, "cannot call main when preRun functions remain to be called");
  a = a || [];
  Ga || (Ga = !0, Xa(Za));
  var c = a.length + 1, d = [C(db(e.thisProgram), "i8", 0)];
  b();
  for (var f = 0;f < c - 1;f += 1) {
    d.push(C(db(a[f]), "i8", 0)), b();
  }
  d.push(0);
  d = C(d, "i32", 0);
  try {
    var g = e._main(c, d, 0);
    hd(g, !0);
  } catch (h) {
    if (!(h instanceof ia)) {
      if ("SimulateInfiniteLoop" == h) {
        e.noExitRuntime = !0;
      } else {
        throw h && "object" === typeof h && h.stack && e.W("exception thrown: " + [h, h.stack]), h;
      }
    }
  } finally {
  }
};
function gd(a) {
  function b() {
    if (!e.calledRun && (e.calledRun = !0, !w)) {
      Ga || (Ga = !0, Xa(Za));
      Xa($a);
      if (e.onRuntimeInitialized) {
        e.onRuntimeInitialized();
      }
      e._main && id && e.callMain(a);
      if (e.postRun) {
        for ("function" == typeof e.postRun && (e.postRun = [e.postRun]);e.postRun.length;) {
          cb(e.postRun.shift());
        }
      }
      Xa(ab);
    }
  }
  a = a || e.arguments;
  null === ed && (ed = Date.now());
  if (!(0 < I)) {
    if (e.preRun) {
      for ("function" == typeof e.preRun && (e.preRun = [e.preRun]);e.preRun.length;) {
        bb(e.preRun.shift());
      }
    }
    Xa(Ya);
    0 < I || e.calledRun || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        e.setStatus("");
      }, 1);
      b();
    }, 1)) : b());
  }
}
e.run = e.run = gd;
function hd(a, b) {
  if (!b || !e.noExitRuntime) {
    if (!e.noExitRuntime && (w = !0, m = void 0, Xa(H), e.onExit)) {
      e.onExit(a);
    }
    da ? (process.stdout.once("drain", function() {
      process.exit(a);
    }), console.log(" "), setTimeout(function() {
      process.exit(a);
    }, 500)) : ea && "function" === typeof quit && quit(a);
    throw new ia(a);
  }
}
e.exit = e.exit = hd;
var jd = [];
function v(a) {
  void 0 !== a ? (e.print(a), e.W(a), a = JSON.stringify(a)) : a = "";
  w = !0;
  var b = "abort(" + a + ") at " + Na() + "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
  jd && jd.forEach(function(c) {
    b = c(b, a);
  });
  throw b;
}
e.abort = e.abort = v;
if (e.preInit) {
  for ("function" == typeof e.preInit && (e.preInit = [e.preInit]);0 < e.preInit.length;) {
    e.preInit.pop()();
  }
}
var id = !0;
e.noInitialRun && (id = !1);
gd();



  return Module;
};