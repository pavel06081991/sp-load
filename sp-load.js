'use strict';

var path = require('path'),
  stringToRegexp = require('string-to-regexp'),
  findup = require('findup-sync'),
  _ = require('lodash'),
  isThere = require('is-there'),

  spLoad = {
    CONFIG_FILE_NAME: 'package.json',
    ADDITIONAL_CONFIG_FILE_NAME: '_sp-load.json',
    CONFIG_PROPERTY_NAME: '_sp-load',
    LOCAL_MODULES_PROPERTY: '_localDependencies',
    CORE_MODULES_PROPERTY: '_coreDependencies',
    EXTERNAL_MODULES_PROPERTIES: [
      'dependencies',
      'devDependencies',
      'peerDependencies'
    ],

    defaultConfig: {
      camelizing: true
    },

    get modulesProperties() {
      var modulesProperties = _.clone(this.EXTERNAL_MODULES_PROPERTIES);

      modulesProperties.push(this.LOCAL_MODULES_PROPERTY);
      modulesProperties.push(this.CORE_MODULES_PROPERTY);

      Object.defineProperty(this, 'modulesProperties', {
        configurable: true,
        enumerable: true,
        value: modulesProperties
      });

      return modulesProperties;
    },

    modulesStorage: {},

    getModules: function(parentModule) {
      this.setInitialData(parentModule);
      this.registerModules();

      return this.modulesStorage[this.configDirPath];
    },

    setInitialData: function(parentModule) {
      this.configFilePath = findup(this.CONFIG_FILE_NAME, {cwd: path.resolve(parentModule.filename, '../')});
      this.configDirPath = path.resolve(this.configFilePath, '../');
      this.additionalConfigFilePath = path.resolve(this.configDirPath, this.ADDITIONAL_CONFIG_FILE_NAME);
      this.parentModule = parentModule;
    },

    registerModules: function() {
      if (this.isConfigResolved()) return;

      this.getConfig();
      this.applyDefaultConfig();
      this.resolveConfig();
    },

    getConfig: function() {
      this.configFileContent = _.clone(require(this.configFilePath), true);
      this.additionalConfigFileContent = isThere(this.additionalConfigFilePath) && require(this.additionalConfigFilePath);

      _.defaultsDeep(this.configFileContent, this.additionalConfigFileContent);

      this.config = this.configFileContent[this.CONFIG_PROPERTY_NAME] ? this.configFileContent[this.CONFIG_PROPERTY_NAME]
        : {};
    },

    isConfigResolved: function() {
      return this.modulesStorage[this.configDirPath] ? true : false;
    },

    applyDefaultConfig: function() {
      _.defaultsDeep(this.config, this.defaultConfig);
    },

    resolveConfig: function() {
      this.getModulesList();
      this.formatModulesNames();
      this.resolveModules();
    },

    getModulesList: function() {
      this.modulesList = {};

      this.modulesProperties.forEach((modulesProperty) => {
        _.forOwn(this.configFileContent[modulesProperty], (modulePath, moduleName) => {
          if (this.isExternalModulesProperty(modulesProperty) || this.isCoreModulesProperty(modulesProperty)) {
            this.modulesList[moduleName] = moduleName;
          } else {
            this.modulesList[moduleName] = path.resolve(this.configDirPath, modulePath);
          }
        });
      });
    },

    isExternalModulesProperty: function(modulesProperty) {
      return this.EXTERNAL_MODULES_PROPERTIES.indexOf(modulesProperty) !== -1;
    },

    isCoreModulesProperty: function(modulesProperty) {
      return modulesProperty === this.CORE_MODULES_PROPERTY;
    },

    formatModulesNames: function() {
      var replacing = this.config.replacing,
        camelizing = this.config.camelizing,
        renamingMap,
        newModuleName;

      this.renameModulesNames();

      if (!replacing && !camelizing) {
        return;
      }

      renamingMap = {};

      _.forOwn(this.modulesList, (modulePath, moduleName) => {
        newModuleName = moduleName;

        if (replacing) {
          _.forOwn(replacing, (replacingValue, replacingPattern) => {
            newModuleName = newModuleName.replace(stringToRegexp(replacingPattern), replacingValue);
          });
        }

        if (camelizing && newModuleName !== '_') {
          newModuleName =  _.camelCase(newModuleName);
        }

        if (newModuleName !== moduleName) {
          renamingMap[moduleName] = newModuleName;
        }
      });

      this.renameModulesNames(renamingMap);
    },

    renameModulesNames: function(renamingMap) {
      if (!renamingMap) {
        renamingMap = this.config.renaming;
      }

      if (!renamingMap) return;

      _.forOwn(renamingMap, (newModuleName, oldModuleName) => {
        if (newModuleName === oldModuleName || !this.modulesList[oldModuleName]) {
          return;
        }

        this.modulesList[newModuleName] = this.modulesList[oldModuleName];

        delete this.modulesList[oldModuleName];
      });
    },

    resolveModules: function() {
      this.modulesStorage[this.configDirPath] = Object.create({}, {
        _spModulesList: {
          value: this.modulesList
        }
      });

      _.forOwn(this.modulesList, (modulePath, moduleName) => {
        this.resolveModule(modulePath, moduleName, this.parentModule);
      });
    },

    resolveModule: function(modulePath, moduleName, parentModule) {
      var modulesStorageItem = this.modulesStorage[this.configDirPath];

      Object.defineProperty(modulesStorageItem, moduleName, {
        configurable: true,
        enumerable: true,
        get: () => {
          return parentModule.require(modulePath);
        }
      });
    }
  };

module.exports = spLoad;