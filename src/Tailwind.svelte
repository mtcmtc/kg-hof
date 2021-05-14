<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;


	@layer components {
	  @variants responsive {
	    .arrow:before{
	    	content:'';
			position: absolute;
			top:50%;
			transform:translateY(-50%);
			width:10px;
			height:10px;
	    }

	    .arrow.left:before{
	    	left:-15px;
	    	right:auto;
			border-top:10px solid transparent;
			border-right:15px solid #fff;
			border-bottom:10px solid transparent;
			border-left: none;
		}

		.arrow.right:before{
			right:-15px;
			left: auto;
			border-top:10px solid transparent;
			border-bottom:10px solid transparent;
			border-left:15px solid #fff;
			border-right: none;
	    }
	  }
	}

	.twitter-tweet{ margin: 0 auto !important;}
	iframe{ width:100% !important; }
</style>