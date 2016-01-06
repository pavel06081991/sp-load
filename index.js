'use strict';

var path = require('path'),
  stringToRegexp = require('string-to-regexp'),
  findup = require('findup-sync'),
  camelcase = require('camelcase'),
  loadOnDemand = {
    storage: {},

    EXTERNAL_MODULES_PROPERTIES: [
      'dependencies',
      'devDependencies',
      'peerDependencies'
    ],

    DEFAULT_LAZY_LOADING_VALUE: true,

    DEFAULT_CAMELIZING_VALUE: true,

    defaultId: '$',

    registerModules: function(settings) {
      settings.forEach(this.handleSettings.bind(this));
    },

    handleSettings: function(settings) {
      var modulesListsFilePath = findup('package.json', {cwd: settings.currentModuleDir}),
        modulesListsFileDir = path.resolve(modulesListsFilePath, '../'),
        modulesList = this.getModulesList(modulesListsFilePath, modulesListsFileDir, settings.modulesListsProperties);

      settings.formatting = settings.formatting ? settings.formatting : {};

      if (settings.lazy === undefined) {
        settings.lazy = this.DEFAULT_LAZY_LOADING_VALUE;
      }

      this.formatModulesNames(modulesList, settings.formatting);

      this.applyModules(modulesList, modulesListsFileDir, settings.destination, settings.id, settings.requireFn, settings.lazy);
    },

    getModulesList: function(modulesListsFilePath, modulesListsFileDir, modulesListsProperties) {
      var modulesListsFileContent = require(modulesListsFilePath),
        modulesList = {},
        moduleName,
        isExternalModule,
        modulesListInFile;

      modulesListsProperties = modulesListsProperties ? modulesListsProperties : this.EXTERNAL_MODULES_PROPERTIES;

      modulesListsProperties.forEach(function(modulesListsProperty) {
        if (!modulesListsFileContent[modulesListsProperty]) {
          return;
        }

        modulesListInFile = modulesListsFileContent[modulesListsProperty];

        isExternalModule = this.EXTERNAL_MODULES_PROPERTIES.indexOf(modulesListsProperty) !== -1;

        for (moduleName in modulesListInFile) {
          if (!modulesListInFile.hasOwnProperty(moduleName)) {
            continue
          }

          modulesList[moduleName] = isExternalModule ? moduleName :
            path.resolve(modulesListsFileDir, modulesListInFile[moduleName]);
        }
      }, this);

      return modulesList;
    },

    formatModulesNames: function(modulesList, formatting) {
      if (formatting.camelizing === undefined) {
        formatting.camelizing = this.DEFAULT_CAMELIZING_VALUE;
      }

      formatting.renaming && this.renameModulesNames(modulesList, formatting.renaming);
      formatting.replacing && this.replaceModulesNames(modulesList, formatting.replacing);
      formatting.camelizing && this.camelizeModulesNames(modulesList);
    },

    renameModulesNames: function(modulesList, renamingMap) {
      var newModuleName,
        oldModuleName;

      for (oldModuleName in renamingMap) {
        if (!renamingMap.hasOwnProperty(oldModuleName)) {
          continue
        }

        newModuleName = renamingMap[oldModuleName];

        if (newModuleName === oldModuleName || !modulesList[oldModuleName]) {
          return;
        }

        modulesList[newModuleName] = modulesList[oldModuleName];
        delete modulesList[oldModuleName];
      }
    },

    replaceModulesNames: function(modulesList, replacingMap) {
      var renamingMap = {},
        moduleName,
        moduleNameReplacingPattern,
        moduleNameReplacingValue,
        newModuleName;

      for (moduleName in modulesList) {
        if (!modulesList.hasOwnProperty(moduleName)) {
          continue
        }

        newModuleName = moduleName;

        for (moduleNameReplacingPattern in replacingMap) {
          if (!replacingMap.hasOwnProperty(moduleNameReplacingPattern)) {
            continue
          }

          moduleNameReplacingValue = replacingMap[moduleNameReplacingPattern];

          newModuleName = newModuleName.replace(stringToRegexp(moduleNameReplacingPattern), moduleNameReplacingValue);
        }

        if (newModuleName !== moduleName) {
          renamingMap[moduleName] = newModuleName
        }
      }

      this.renameModulesNames(modulesList, renamingMap)
    },

    camelizeModulesNames: function(modulesList) {
      var renamingMap = {},
        moduleName,
        newModuleName;

      for (moduleName in modulesList) {
        if (!modulesList.hasOwnProperty(moduleName)) {
          continue
        }

        newModuleName = camelcase(moduleName);

        if (newModuleName !== moduleName) {
          renamingMap[moduleName] = newModuleName
        }
      }

      this.renameModulesNames(modulesList, renamingMap);
    },

    applyModules: function(modulesList, modulesListsFileDir, destination, id, requireFn, lazy) {
      var moduleName,
        modulePath;

      id = id ? id : this.defaultId;

      if (!this.storage[modulesListsFileDir]) {
        this.storage[modulesListsFileDir] = {};
      }

      if (!this.storage[modulesListsFileDir][id]) {
        this.storage[modulesListsFileDir][id] = {};
      }

      destination = this.storage[modulesListsFileDir][id];

      for (moduleName in modulesList) {
        if (!modulesList.hasOwnProperty(moduleName)) {
          continue
        }

        modulePath = modulesList[moduleName];

        this.applyModule(destination, moduleName, modulePath, requireFn, lazy);
      }

      this.storage[modulesListsFileDir][id] = destination;
    },

    applyModule: function(destination, moduleName, modulePath, requireFn, lazy) {
      if (!lazy) {
        destination[moduleName] = requireFn(modulePath);
        return;
      }

      Object.defineProperty(destination, moduleName, {
        configurable: true,
        enumerable: true,
        get: function() {
          var mod = requireFn(modulePath);

          Object.defineProperty(destination, moduleName, {
            configurable: false,
            enumerable: true,
            value: mod
          });

          return mod;
        }
      });
    },

    getModules: function(currentModuleDir, id) {
      var currentModuleDirAncestor;

      id = id ? id : this.defaultId;

      while (!this.storage[currentModuleDir]) {
        currentModuleDirAncestor = path.resolve(currentModuleDir, '../');

        if (currentModuleDirAncestor === currentModuleDir) {
          return;
        }

        currentModuleDir = currentModuleDirAncestor;
      }

      return this.storage[currentModuleDir][id];
    }
  };

module.exports = loadOnDemand;