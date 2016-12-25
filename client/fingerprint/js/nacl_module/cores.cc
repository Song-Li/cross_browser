// Based on a PNaCl example, copyright chromium authors 2013, BSD-style

#include <string>
#include <unistd.h>

#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"


class CoresInstance : public pp::Instance {
public:
    CoresInstance(PP_Instance instance) : pp::Instance(instance) {}
private:
    void HandleMessage(const pp::Var& var_message) {
        int x = sysconf(_SC_NPROCESSORS_ONLN);
        pp::Var msg(x);
        PostMessage(msg);
    }
};

class CoresModule : public pp::Module {
public:
    CoresModule() : pp::Module() {}

    pp::Instance* CreateInstance(PP_Instance instance) {
        return new CoresInstance(instance);
    }
};

namespace pp {
Module* CreateModule() { return new CoresModule(); }
}  // namespace pp
