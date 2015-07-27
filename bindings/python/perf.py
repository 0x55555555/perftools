import os, sys, ctypes

class Util:
    def library_path():
        lib = os.path.dirname(os.path.realpath(__file__)) + "/../../build/lib/libperf"
        plat = sys.platform
        if plat == "win32":
            lib += ".dll"
        elif plat == "darwin":
            lib += ".dylib"
        else:
            lib += ".so"

        return lib

    @staticmethod
    def c_str(str):
        if sys.version_info.major == 3:
            return bytes(str, 'utf-8')
        else:
            return str

    @staticmethod
    def p_str(str):
        if sys.version_info.major == 3:
            return str.decode('utf-8')
        else:
            return str


    # Load the perf library
    perf = ctypes.cdll.LoadLibrary(library_path())

    # Extract perf functions

    perf_init_default_config = perf.perf_init_default_config
    perf_init_default_config.argtypes = [ ctypes.c_char_p ]
    perf_init_default_config.restype = ctypes.c_void_p

    perf_term_config = perf.perf_term_config
    perf_term_config.argtypes = [ ctypes.c_void_p ]

    perf_find_identity = perf.perf_find_identity
    perf_find_identity.argtypes = [ ctypes.c_void_p ]
    perf_find_identity.restype = ctypes.c_void_p

    perf_identity_description = perf.perf_identity_description
    perf_identity_description.argtypes = [ ctypes.c_void_p ]
    perf_identity_description.restype = ctypes.c_char_p

    perf_init_context = perf.perf_init_context
    perf_init_context.argtypes = [ ctypes.c_void_p, ctypes.c_char_p ]
    perf_init_context.restype = ctypes.c_void_p

    perf_term_context = perf.perf_term_context
    perf_term_context.argtypes = [ ctypes.c_void_p ]

    perf_dump_context = perf.perf_dump_context
    perf_dump_context.argtypes = [ ctypes.c_void_p ]
    perf_dump_context.restype = ctypes.c_char_p

    perf_write_context = perf.perf_write_context
    perf_write_context.argtypes = [ ctypes.c_void_p, ctypes.c_char_p ]

    perf_init_meta_event = perf.perf_init_meta_event
    perf_init_meta_event.argtypes = [ ctypes.c_void_p, ctypes.c_char_p ]
    perf_init_meta_event.restype = ctypes.c_void_p

    perf_term_meta_event = perf.perf_term_meta_event
    perf_term_meta_event.argtypes = [ ctypes.c_void_p ]

    perf_init_event = perf.perf_init_event
    perf_init_event.argtypes = [ ctypes.c_void_p ]
    perf_init_event.restype = ctypes.c_void_p

    perf_term_event = perf.perf_term_event
    perf_term_event.argtypes = [ ctypes.c_void_p ]

class Wrapper:
    """
    Wrapper class handles inter object dependencies, allows using objects with "with",
    and implements __del__ to try and clean up C objects.

    If a Wrapper object is destroyed then any dependent C data is also freed, leaving python
    wrappers dangling - but better than segment faulting in python later.
    """
    def __init__(self, obj):
        self._obj = obj
        self._dependants = None

    @property
    def object(self):
        return self._obj

    def add_dependant(self, dep):
        """
        Add a new object which must be released before this object can be
        """
        if self._dependants == None:
            self._dependants = []
        self._dependants.append(dep)

    def release_tree(self):
        """
        Release this object and any dependents in the correct order
        """
        if self._dependants:
            for dep in self._dependants:
                dep.release_tree()

        if self._obj:
            self.release()
            self._obj = None

    def __del__(self):
        self.release_tree()

    def __enter__(self):
        return self._obj

    def __exit__(self, type, value, traceback):
        self.release_tree()


class Config(Wrapper):
    def __init__(self):
        binding = Util.c_str("python{}{}".format(sys.version_info.major, sys.version_info.minor))
        super(Config, self).__init__(Util.perf_init_default_config(binding))

    def release(self):
        Util.perf_term_config(self.object)

    @property
    def identity(self):
        return Identity(Util.perf_find_identity(self.object))

class Identity:
    def __init__(self, obj):
        self._obj = obj

    def to_json(self):
        return Util.p_str(Util.perf_identity_description(self._obj))

    def __str__(self):
        return self.to_json()

class Context(Wrapper):
    def __init__(self, config, name):
        config.add_dependant(self)
        super(Context, self).__init__(Util.perf_init_context(config.object, Util.c_str(name)))

    def release(self):
        Util.perf_term_context(self.object)

    def to_json(self):
        return Util.p_str(Util.perf_dump_context(self._obj))

    def __str__(self):
        return self.to_json()

    def write(self, name):
        Util.perf_write_context(self.object, Util.c_str(name))

class MetaEvent(Wrapper):
    def __init__(self, context, name):
        context.add_dependant(self)
        super(MetaEvent, self).__init__(Util.perf_init_meta_event(context.object, Util.c_str(name)))

    def release(self):
        Util.perf_term_meta_event(self.object)

class Event(Wrapper):
    def __init__(self, event):
        event.add_dependant(self)
        super(Event, self).__init__(Util.perf_init_event(event.object))

    def release(self):
        Util.perf_term_event(self.object)
