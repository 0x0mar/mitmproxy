define(["./AbstractView",
        "dojo/text!./templates/BinaryView.html"], 
        function(AbstractView, template) {
           
  var BinaryView = AbstractView.createSubclass([],{
  	templateString: template
  });
  
  BinaryView.className = "flow-binary";
  BinaryView.matches   = function(flow) {
    throw new Error("unimplemented");
  };

  return BinaryView;
});