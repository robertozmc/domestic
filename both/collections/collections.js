iwagaData = new Mongo.Collection('iwagaData');
sleapData = new Mongo.Collection('sleapData');
domesticUsers = new Mongo.Collection('domesticUsers');

iwagaBinaryDataStore = new FS.Store.GridFS("iwagaBinaryData");
iwagaBinaryData = new FS.Collection("iwagaBinaryData", {
    stores: [iwagaBinaryDataStore]
});

sleapBinaryDataStore = new FS.Store.GridFS("sleapBinaryData");
sleapBinaryData = new FS.Collection("sleapBinaryData", {
    stores: [sleapBinaryDataStore]
});