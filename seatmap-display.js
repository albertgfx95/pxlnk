var _businessSeat;
var _economySeat;
var _firstClassSeat;

var economyImg;
var businessImg;
var firstClassImg;

var _seatWidthOnly = 17;

var _seatDimensionOnly = {
	F : {
		width : _seatWidthOnly,
		height : 28.33,
		paddingTopBottom : 5,
		marginTopBottom : 0
	},
	C : {
		width : _seatWidthOnly,
		height : 22.67,
		paddingTopBottom : 5,
		marginTopBottom : 0
	},
	Y : {
		width : _seatWidthOnly,
		height : 17,
		paddingTopBottom : 2.5,
		marginTopBottom : 0
	},
	8 : {
		width : _seatWidthOnly,
		height : 17,
		paddingTopBottom : 2,
		marginTopBottom : 0
	},
	D : {
		width : 25,
		height : 25,
		paddingTopBottom : 0,
		marginTopBottom : 0
	},
	L : {
		height : 25,
		paddingTopBottom : 0,
		marginTopBottom : 10
	},
	G : {
		height : 25,
		paddingTopBottom : 0,
		marginTopBottom : 10
	},
	B : {
		height : 17,
		marginTopBottom : 2,
		paddingTopBottom : 0
	},	
	ZOS : {
		height : 26.25,
		marginTopBottom : 0,
		paddingTopBottom : 0
	},
	ZOE : {
		height : 2,
		marginTopBottom : 0,
		paddingTopBottom : 0
	}
};

_detailNames = {
	'B' : 'Bassinet',
	'1D' : 'Undesirable Seat (Restricted Recline)',
	'1' : 'Undesirable Seat (Restricted - General)',
	'A' : 'Aisle Seat',
	'W' : 'Window Seat',
	'E' : 'Emergency Seat',
	'OW' : 'Over Wing Seat',
	'ZO' : 'Zone',
	'J' : 'Jump Seat',
	'NI' : 'Not Suitable for Infant',
	'Z' : 'Seat Block',
	'PS' : 'Premium Seat'
};

//_zoneColor = ['#FFD9D9', '#FFE5B5', '#F9FFB3', '#E6FFB5','#D9FFF9', '#DBD9FF', '#F1D9FF'];
_zoneColor = ['#FFF', '#FFF'];

$.seatmapDisplayOnly = function(div, seatmap, webPath)
{
	if(seatmap.seats.length == 0)
	{
		var notice = '<div class="no-seatmap text-center" style="padding:18px;"> <span style="color:#d43f3a"> You haven\'t uploaded any seatmap. </span> </div>';
		$('#' + div).html(notice);
	}
	else
	{
		_drawSeatmapOnly(div, seatmap, webPath);
	}
}


function _drawSeatmapOnly(div, seatmap, webPath)
{
	if(seatmap.hasOwnProperty('zone') == false)
	{
		seatmap.zone = [];
	}

	_businessSeat = '<img src="' + webPath + '/images/plane-icon/business-class-seat.png" width="20px">';
	_economySeat = '<img src="' + webPath + '/images/plane-icon/economy-class-seat-copy.png" width="20px">';
	_firstClassSeat = '<img src="' + webPath + '/images/plane-icon/first-class-seat.png" width="20px">';
	economyImg = 'economy-class-seat.png';
	businessImg = 'business-class-seat.png';
	firstClassImg = 'first-class-seat.png';
	leftExitImg = 'left-exit.png';
	rightExitImg = 'right-exit.png';

	str = '';
	var tempRowNum = '';
	var lastColnum = _getLastColnum(seatmap.seats);

	var startWing = Math.min.apply(Math, seatmap.details.filter(function(e){
		return e.EDIFACT_CODE == 'OW';
	}).map(function(e){
		return e.ROW_NUM;
	}));

	var endWing = Math.max.apply(Math, seatmap.details.filter(function(e){
		return e.EDIFACT_CODE == 'OW';
	}).map(function(e){
		return e.ROW_NUM;
	}));

	var rowsList = $.grep(seatmap.seats, function(e) {
		return e.COL_NUM == '1';
	});

	var firstRowNum = seatmap.zone.map(function(zones) {
	  return parseInt(zones['FIRST_ROW_NUM']);
	});

	var lastRowNum = seatmap.zone.map(function(zones) {
	  return parseInt(zones['LAST_ROW_NUM']);
	});

	str += '\
		<div class="map col-sm-12" style="margin-bottom: 10px;">\
			<center>\
				<table class="numbering" style="display:inline-block;vertical-align:top;margin-right:-5px;zoom:0.92;margin-top:7px;">\
					<tr>\
						<td height="25px"></td>\
					<tr>\
		';

	totalSeatCol = 0;

	for(var i = 0 ; i < seatmap.header.length; i++)
	{
		if(seatmap.header[i].SEATCOL != null && seatmap.header[i].SEATCOL.trim() != '')
		{
			totalSeatCol++;
		}
	}

	//Left Wing + Row Numbering
	for (var i = 0 ; i < rowsList.length ; i++)
	{
		seatrow = rowsList[i]['SEATROW'];
		rowNum = rowsList[i]['ROW_NUM'];
		colNum = rowsList[i]['COL_NUM'];
		seatclass = rowsList[i]['CLASS'];
		
		details = $.grep(seatmap.details , function(e){
			return e.ROW_NUM == rowNum;
		});

		hasLavatory = false;
		hasGalley = false;
		hasExitDoor = false;
		hasBassinet = false;
		countEmpty = 0;

		details.forEach(function(e) {
			if(e.EDIFACT_CODE == 'LA')
			{
				hasLavatory = true;
			}
			else if(e.EDIFACT_CODE == 'GN')
			{
				hasGalley = true;
			}
			else if(e.EDIFACT_CODE == 'D')
			{
				hasExitDoor = true;
			}
			else if(e.EDIFACT_CODE == 'B')
			{
				hasBassinet = true;
			}
			else if(e.EDIFACT_CODE == '8')
			{
				countEmpty++;
			}
		});

		if (hasLavatory)
		{
			seatDimensionKey = 'L';
		}
		else if (hasGalley)
		{
			seatDimensionKey = 'G';
		}
		else if (hasExitDoor)
		{
			seatDimensionKey = 'D';
		}
		else if(countEmpty >= totalSeatCol)
		{
			seatDimensionKey = '8';
		}
		else
		{
			if (seatclass != null && seatclass.trim() != '')
			{
				seatDimensionKey = '' + seatclass;
			}
			else
			{
				seatDimensionKey = '8';
			}
		}

		height = _seatDimensionOnly[seatDimensionKey].height + (2 * _seatDimensionOnly[seatDimensionKey].paddingTopBottom) + (2 * _seatDimensionOnly[seatDimensionKey].marginTopBottom);

		/*start*/
		if(seatmap.zone.length > 0)
		{
			seatmap.zone.sort( _sortingZone );

			if(rowNum >= startWing && rowNum <= endWing)
			{
				additionalBorderTop = "";
				additionalBorderBottom = "";

				if (rowNum == startWing)
				{
						additionalBorderTop = "border-top: 1px solid black;"
				}
					else if(rowNum == endWing)
				{
						additionalBorderBottom = "border-bottom: 1px solid black;"
				}

				if (hasBassinet && !hasLavatory && !hasGalley)
				{
					bassinetHeight = _seatDimensionOnly['B'].height + (2 * _seatDimensionOnly['B'].paddingTopBottom) + (2 * _seatDimensionOnly['B'].marginTopBottom);
					str += '\
									<tr>\
										<td style="padding:0px 15px; height: ' + bassinetHeight + 'px; border-left: 1px solid black; border-right: 1px solid black;' + additionalBorderTop + '" align="right" class="rowHeaderColumn bassinetRow">\
										</td>\
									</tr>\
					';
					str += '<tr>\
							<td align="right" class="rowHeaderColumn" data-rownum="' + rowNum + '" style="'+setPadding(seatrow)+' height: ' + height + 'px; border-left: 1px solid black; border-right: 1px solid black; ' + additionalBorderBottom + '" data-seatrow="' + (seatrow == null || seatrow == '' ? '' : seatrow) + '">\
								<span class="rowHeader"> <b>' + (seatrow == null || seatrow == '' ? '&bull;' : seatrow) + '</b> </span>\
								<input type="text" class="rowHeaderTxt" onkeypress="return numericKeypress(event);" data-rownum="' + rowNum + '" value="' + (seatrow == null || seatrow == '' ? '' : seatrow)  + '" hidden />\
							</td>\
						</tr>';
				}
				else
				{	
					// if(firstRowNum.indexOf(parseInt(rowNum) !== -1) && rowNum == startWing){
					// 	console.log(rowNum);
					// 	console.log(startWing);
					// 	console.log(firstRowNum.indexOf(parseInt(rowNum)));
					// 	ZOSHeight = _seatDimensionOnly['ZOS'].height + (2 * _seatDimensionOnly['ZOS'].paddingTopBottom) + (2 * _seatDimensionOnly['ZOS'].marginTopBottom);
					// 	str += '\
					// 					<tr>\
					// 						<td style="padding:0px 15px; height: ' + ZOSHeight + 'px; border-right: 1px solid black;" align="right" class="rowHeaderColumn bassinetRow">\
					// 						a</td>\
					// 					</tr>\
					// 	';
					// }
					// else 
					if(firstRowNum.indexOf(parseInt(rowNum)) != -1)
					{
						if (rowNum == startWing)
						{
						ZOSHeight = _seatDimensionOnly['ZOS'].height + (2 * _seatDimensionOnly['ZOS'].paddingTopBottom) + (2 * _seatDimensionOnly['ZOS'].marginTopBottom);
						str += '\
										<tr>\
											<td style="padding:0px 15px; height: ' + ZOSHeight + 'px; " align="right" class="rowHeaderColumn bassinetRow">\
											</td>\
										</tr>\
						';
					}
						else
						{
							ZOSHeight = _seatDimensionOnly['ZOS'].height + (2 * _seatDimensionOnly['ZOS'].paddingTopBottom) + (2 * _seatDimensionOnly['ZOS'].marginTopBottom);
							str += '\
											<tr>\
												<td style="padding:0px 15px; height: ' + ZOSHeight + 'px; border-left: 1px solid black; border-right: 1px solid black;" align="right" class="rowHeaderColumn bassinetRow">\
												</td>\
											</tr>\
							';
						}
					}
					else if(lastRowNum.indexOf(parseInt(rowNum)) != -1)
					{
						ZOEHeight = _seatDimensionOnly['ZOE'].height + (2 * _seatDimensionOnly['ZOE'].paddingTopBottom) + (2 * _seatDimensionOnly['ZOE'].marginTopBottom);
						str += '\
										<tr>\
											<td style="padding:0px 15px; height: ' + ZOEHeight + 'px; border-left: 1px solid black; border-right: 1px solid black;' + additionalBorderTop + '" align="right" class="rowHeaderColumn bassinetRow">\
											</td>\
										</tr>\
						';
					}
					str += '<tr>\
							<td align="right" class="rowHeaderColumn wing-row" data-rownum="' + rowNum + '" style="'+setPadding(seatrow)+' height: ' + height + 'px; border-left: 1px solid black; border-right: 1px solid black; ' + additionalBorderTop + ' ' + additionalBorderBottom + '" data-seatrow="' + (seatrow == null || seatrow == '' ? '' : seatrow) + '">\
								<span class="rowHeader"> <b>' + (seatrow == null || seatrow == '' ? '&bull;' : seatrow) + '</b> </span>\
								<input type="text" class="rowHeaderTxt" onkeypress="return numericKeypress(event);" data-rownum="' + rowNum + '" value="' + (seatrow == null || seatrow == '' ? '' : seatrow)  + '" hidden />\
							</td>\
						</tr>';
				}			
			}
			else
			{
				if (hasBassinet && !hasLavatory && !hasGalley)
				{
					bassinetHeight = _seatDimensionOnly['B'].height + (2 * _seatDimensionOnly['B'].paddingTopBottom) + (2 * _seatDimensionOnly['B'].marginTopBottom);
					str += '\
									<tr>\
										<td style="padding:0px 15px; height: ' + bassinetHeight + 'px;" align="right" class="rowHeaderColumn">\
										</td>\
									</tr>\
					';
				}

				if(firstRowNum.indexOf(parseInt(rowNum)) != -1)
				{
					ZOSHeight = _seatDimensionOnly['ZOS'].height + (2 * _seatDimensionOnly['ZOS'].paddingTopBottom) + (2 * _seatDimensionOnly['ZOS'].marginTopBottom);
					str += '\
									<tr>\
										<td style="padding:0px 15px; height: ' + ZOSHeight + 'px;" align="right" class="rowHeaderColumn">\
										</td>\
									</tr>\
					';
				}
				else if(lastRowNum.indexOf(parseInt(rowNum)) != -1)
				{
					ZOEHeight = _seatDimensionOnly['ZOE'].height + (2 * _seatDimensionOnly['ZOE'].paddingTopBottom) + (2 * _seatDimensionOnly['ZOE'].marginTopBottom);
					str += '\
									<tr>\
										<td style="padding:0px 15px; height: ' + ZOEHeight + 'px;" align="right" class="rowHeaderColumn">\
										</td>\
									</tr>\
					';
				}
				str += '<tr>\
						<td align="right" class="rowHeaderColumn" data-rownum="' + rowNum + '" style="'+setPadding(seatrow)+' height: ' + height + 'px;" data-seatrow="' + (seatrow == null || seatrow == '' ? '' : seatrow) + '">\
							<span class="rowHeader"> <b>' + (seatrow == null || seatrow == '' ? '&bull;' : seatrow) + '</b> </span>\
							<input type="text" class="rowHeaderTxt" onkeypress="return numericKeypress(event);" data-rownum="' + rowNum + '" value="' + (seatrow == null || seatrow == '' ? '' : seatrow)  + '" hidden />\
						</td>\
					</tr>';			
			}		
		}/*end*/
		else
		{
			if(rowNum >= startWing && rowNum <= endWing)
			{
				additionalBorderTop = "";
				additionalBorderBottom = "";

				if (rowNum == startWing)
				{
						additionalBorderTop = "border-top: 1px solid black;"
				}
					else if(rowNum == endWing)
				{
						additionalBorderBottom = "border-bottom: 1px solid black;"
				}

				if (hasBassinet && !hasLavatory && !hasGalley)
				{
					bassinetHeight = _seatDimensionOnly['B'].height + (2 * _seatDimensionOnly['B'].paddingTopBottom) + (2 * _seatDimensionOnly['B'].marginTopBottom);
					str += '\
									<tr>\
										<td style="padding:0px 15px; height: ' + bassinetHeight + 'px; border-left: 1px solid black; border-right: 1px solid black;' + additionalBorderTop + '" align="right" class="rowHeaderColumn bassinetRow">\
										</td>\
									</tr>\
					';
					str += '<tr>\
							<td align="right" class="rowHeaderColumn" data-rownum="' + rowNum + '" style="'+setPadding(seatrow)+' height: ' + height + 'px; border-left: 1px solid black; border-right: 1px solid black; ' + additionalBorderBottom + '" data-seatrow="' + (seatrow == null || seatrow == '' ? '' : seatrow) + '">\
								<span class="rowHeader"> <b>' + (seatrow == null || seatrow == '' ? '&bull;' : seatrow) + '</b> </span>\
								<input type="text" class="rowHeaderTxt" onkeypress="return numericKeypress(event);" data-rownum="' + rowNum + '" value="' + (seatrow == null || seatrow == '' ? '' : seatrow)  + '" hidden />\
							</td>\
						</tr>';
				}
				else
				{
					str += '<tr>\
							<td align="right" class="rowHeaderColumn" data-rownum="' + rowNum + '" style="'+setPadding(seatrow)+' height: ' + height + 'px; border-left: 1px solid black; border-right: 1px solid black; ' + additionalBorderTop + ' ' + additionalBorderBottom + '" data-seatrow="' + (seatrow == null || seatrow == '' ? '' : seatrow) + '">\
								<span class="rowHeader"> <b>' + (seatrow == null || seatrow == '' ? '&bull;' : seatrow) + '</b> </span>\
								<input type="text" class="rowHeaderTxt" onkeypress="return numericKeypress(event);" data-rownum="' + rowNum + '" value="' + (seatrow == null || seatrow == '' ? '' : seatrow)  + '" hidden />\
							</td>\
						</tr>';
				}	
			}
			else
			{
				if (hasBassinet && !hasLavatory && !hasGalley)
				{
					bassinetHeight = _seatDimensionOnly['B'].height + (2 * _seatDimensionOnly['B'].paddingTopBottom) + (2 * _seatDimensionOnly['B'].marginTopBottom);
					str += '\
									<tr>\
										<td style="padding:0px 15px; height: ' + bassinetHeight + 'px;" align="right" class="rowHeaderColumn">\
										</td>\
									</tr>\
					';
				}

				str += '<tr>\
							<td align="right" class="rowHeaderColumn" data-rownum="' + rowNum + '" style="'+setPadding(seatrow)+' height: ' + height + 'px;" data-seatrow="' + (seatrow == null || seatrow == '' ? '' : seatrow) + '">\
								<span class="rowHeader"> <b>' + (seatrow == null || seatrow == '' ? '&bull;' : seatrow) + '</b> </span>\
								<input type="text" class="rowHeaderTxt" onkeypress="return numericKeypress(event);" data-rownum="' + rowNum + '" value="' + (seatrow == null || seatrow == '' ? '' : seatrow)  + '" hidden />\
							</td>\
						</tr>';
			}
		}
	}

	tempRowNum = '';
	str += '\
					<!--<tr style="background-image: url(' + webPath + '/images/plane/tail_01.png); background-size: 100% 100%; background-position: -2px 0px">\
						<td height="366px;"></td>\
					</tr>-->\
				</table>\
				<table cellspacing="0" cellpadding="1" border="0" class="seatmap" style="display: inline-block;">\
					<tr style="">\
						<td colspan="' + lastColnum + '" height="25px;" valign="bottom">\
							<center>\
								<!--<img class="windshield" src="' + webPath + '/images/plane/windshield.png">-->\
								<table>\
									<tr>\
			';

	//Seatmap Header
	for (var i = 0 ; i < seatmap.header.length ; i++)
	{
		str += '\
										<td  width="' + _seatWidthOnly + 'px" style="padding-bottom:7px;" align="center" class="colHeaderRow" data-colnum="' + (i + 1) + '" data-seatcol="' + (seatmap.header[i]['SEATCOL']==null?'':seatmap.header[i]['SEATCOL']) + '">\
											<span class="colHeader"> <b>' + (seatmap.header[i]['SEATCOL']==null?'&nbsp':seatmap.header[i]['SEATCOL']) + '</b> </span>\
											<input type="text" class="colHeaderTxt" data-colnum="' + (i + 1 ) + '" value="' + (seatmap.header[i]['SEATCOL']==null?'':seatmap.header[i]['SEATCOL']) + '" hidden />\
										</td>';
		}

	str += '						</tr>\
								</table>\
							<center>\
						</td>\
	';

	str += '</tr>';

	//Seatmap Body
	for (var i = 0 ; i < seatmap.seats.length ; i++)
	{
		seatId = seatmap.seats[i]['ID'];
		seatrow = seatmap.seats[i]['SEATROW'];
		seatcol = seatmap.seats[i]['SEATCOL'];
		seatclass = seatmap.seats[i]['CLASS'];
		rowNum = seatmap.seats[i]['ROW_NUM'];
		colNum = seatmap.seats[i]['COL_NUM'];
		type = "seat";

		details = $.grep(seatmap.details , function(e){
			return e.COL_NUM == colNum && e.ROW_NUM == rowNum;
		}).map(function(e){
			return e.EDIFACT_CODE;
		});

		if(seatmap.blockSeat){
			if(seatmap.blockSeat.length > 0)
			{
				seatBlock = $.grep(seatmap.blockSeat , function(e){
					return e.SEATCOL == seatcol && e.SEATROW == seatrow;
				}).map(function(e){
					return e.EDIFACT_CODE;
				});
			}
			else
			{
				seatBlock = '-';
			}
		}
		else
		{
			seatBlock = '-';
		}

		//if new row
		if (tempRowNum != rowNum)
		{
			if (tempRowNum != '') 
			{
				str += '</tr>';
			}

			if(seatmap.zone.length > 0)
			{
				seatmap.zone.sort( _sortingZone );

				for (var j = 0 ; j < seatmap.zone.length ; j++)
				{
					startZone = parseInt(seatmap.zone[j]['FIRST_ROW_NUM']);
					endZone = parseInt(seatmap.zone[j]['LAST_ROW_NUM']);
					nameZone = seatmap.zone[j]['NAME'];
					lastColnumZone = parseInt(lastColnum) -1;

					if(rowNum >= startZone && rowNum <= endZone)
					{
						if (rowNum == startZone)
						{
							additionalBorder = "border-top: 1px solid black;"
							
							str += '<tr style="height:25px" align=center>\
										<td style="'+additionalBorder+'" colspan="' + lastColnumZone + '">\
											<span style="padding-left:10px;"class="zoneHeader text-uppercase" > <b> '+nameZone+'</b> </span>\
											<input type="text" size="10" class="zoneHeaderTxt text-uppercase" value="'+nameZone+'" style="height:15px padding-left:10px;" hidden />\
										</td>\
										<td style="'+additionalBorder+'">\
											<button type="button" class="btn btn-danger fa fa-times zoneDel" style="display: none;"></button>\
										</td>\
									</tr>\
									<tr>';
			}
			else
			{
				str += '<tr>';
			}
		}
					else if(rowNum == endZone+1)
					{
						additionalBorder = "border-top: 1px solid black;"
						str += '<tr><td style="'+additionalBorder+'" colspan="' + lastColnum + '"></td></tr><tr>';
					}			
					
				}
			}
			
		}

		tempRowNum = rowNum;


		if(seatcol == null || seatcol.trim() == "")
		{
			type = "aisle";
		}
		//Lavatory, Galley, Exit Door
		else if($.inArray('LA',details) != -1 || $.inArray('GN',details) != -1 || $.inArray('D',details) != -1)
		{
			type = "non-seat";
		}
		//No Seat
		else if($.inArray('8',details) != -1)
		{
			type = "blank";
		}

		seatTakenIndicator = '';

		if(typeof seatmap.seats[i]['SEAT_TAKEN'] != 'undefined' && seatmap.seats[i]['SEAT_TAKEN'] == '1')
		{
			seatTakenIndicator = 'taken';
		}

		str += '<td valign="center" align="center" data-details="/' + details.join('/') + '/" data-seatrow="' + (seatrow == null ? '' : seatrow) + '" data-seatcol="' + (seatcol == null ? '' : seatcol) + '" data-seat-id="' + seatId + '" data-colnum=' + colNum + ' data-rownum ="' + rowNum + '" data-seat-class="' + (seatclass == null ? '' : seatclass) + '" class="' + type + ' ' + seatTakenIndicator + '" style="' + (colNum == 1 ? " padding-left:30px!important;" : colNum == lastColnum ? "padding-right: 30px !important" : "") + '">';

		if (type != "aisle")
		{
			//Exit Door
			if($.inArray('D',details) != -1)
			{
				if(colNum == "1")
				{
					// str += '<i class="fa fa-angle-double-left exit-left" aria-hidden="true"></i>';
					// str += '<img src="' + webPath + '/images/plane-icon/left-exit.png" class="exit-left" width="' + _seatDimensionOnly.D.width + 'px">';
					str += '<div class="exit-left" style="background-image: url(' + webPath + '/images/plane-icon/'+leftExitImg+'); background-size:cover; width:' + _seatDimensionOnly.D.width + 'px;height:' + _seatDimensionOnly.D.height + 'px">&nbsp;</div>';
				}
				else
				{
					// str += '<i class="fa fa-angle-double-right exit-right" aria-hidden="true"></i>';
					str += '<img src="' + webPath + '/images/plane-icon/'+rightExitImg+'" class="exit-right" style="width=' + _seatDimensionOnly.D.width + 'px;height:' + _seatDimensionOnly.D.height + 'px">';
				}
				
			}
			//Lavatory
			else if ($.inArray('LA',details) != -1)
			{
				str += '<div class="lavatory"><i class="fa fa-male" aria-hidden="true"></i> | <i class="fa fa-female" aria-hidden="true"></i></div>';
			}
			//Galley
			else if ($.inArray('GN',details) != -1)
			{
				// str += '<div class="galley"><i class="fa fa-coffee" aria-hidden="true"></i></div>';
				str += '<div class="galley"></div>';
			}
			//No Seat / Blank
			else if ($.inArray('8', details) != -1)
			{
				str += '<div style="width:17px;"></div>';
			}
			//Normal Seat
			else
			{
				if ($.inArray('B', details) != -1)
				{
					str +='<img src="' + webPath + '/images/plane-icon/bassinet.png" height="17px" style="margin-bottom:2px; margin-top:2px;">';
				}

				if(seatclass != null && seatclass.trim() != '')
				{
					//Business
					if (seatclass.match('F'))
					{
						//Undesirable seat
						if ($.inArray('1D', details) != -1 || $.inArray('1', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/bad-first-class-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('NI', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/caution-first-class-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('PS', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/premium-first-class-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('A', details) != -1) // Aisle Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/first-class-aisle-seat.png); background-size:cover; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('W', details) != -1) // Window Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/first-class-windows-seat.png); background-size:cover; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('E', details) != -1) // Emergency Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/emergency-first-class-seat.png); background-size:cover; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						else
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/'+firstClassImg+'); background-size:cover !important; width:' + _seatDimensionOnly.F.width + 'px;height:' + _seatDimensionOnly.F.height + 'px"> <span> &nbsp; </span></div>';
						}
						
					}
					else if (seatclass.match('C'))
					{
						if ($.inArray('1D', details) != -1 || $.inArray('1', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/bad-business-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('NI', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/caution-business-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('PS', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/premium-business-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('A', details) != -1) // Aisle Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/business-class-aisle-seat.png); background-size:cover; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('W', details) != -1) // Window Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/business-class-windows-seat.png); background-size:cover; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('E', details) != -1) // Emergency Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/emergency-business-seat.png); background-size:cover; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
						else
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/'+businessImg+'); background-size:cover !important; width:' + _seatDimensionOnly.C.width + 'px;height:' + _seatDimensionOnly.C.height + 'px"> <span> &nbsp; </span></div>';
						}
					}
					else if (seatclass.match('Y'))
					{
						if ($.inArray('1D', details) != -1 || $.inArray('1', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/bad-regular-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('NI', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/caution-regular-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('PS', details) != -1)
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/premium-regular-seat.png); background-size:cover !important; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('A', details) != -1) // Aisle Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/economy-class-aisle-seat.png); background-size:cover; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('W', details) != -1) // Window Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/economy-class-windows-seat.png); background-size:cover; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
						else if ($.inArray('E', details) != -1) // Emergency Seat
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/emergency-regular-seat.png); background-size:cover; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
						else
						{
							str += '<div data-toggle="tooltip" style="background-image: url(' + webPath + '/images/plane-icon/'+economyImg+'); background-size:cover !important; width:' + _seatDimensionOnly.Y.width + 'px;height:' + _seatDimensionOnly.Y.height + 'px"> <span> &nbsp; </span></div>';
						}
					}
				}
				else
				{
					str += '<div style="width:17px;"></div>';
				}
			}
		}
		else
		{
			str += '&nbsp;';
		}

		str += '</td>';
	}

	str += '\
			</tr>\
		</table>\
		<table style="display: inline-block; vertical-align: top; margin-left: -5px">\
			<tr>\
				<td height="25px"></td>\
			<tr>';

	//Right Wing
	for (var i = 0 ; i < rowsList.length ; i++)
	{
		seatrow = rowsList[i]['SEATROW'];
		rowNum = rowsList[i]['ROW_NUM'];
		colNum = rowsList[i]['COL_NUM'];
		seatclass = rowsList[i]['CLASS'];

		details = $.grep(seatmap.details , function(e){
			return e.ROW_NUM == rowNum;
		});

		hasLavatory = false;
		hasGalley = false;
		hasExitDoor = false;
		hasBassinet = false;
		countEmpty = 0;

		details.forEach(function(e) {
			if(e.EDIFACT_CODE == 'LA')
			{
				hasLavatory = true;
			}
			else if(e.EDIFACT_CODE == 'GN')
			{
				hasGalley = true;
			}
			else if(e.EDIFACT_CODE == 'D')
			{
				hasExitDoor = true;
			}
			else if(e.EDIFACT_CODE == 'B')
			{
				hasBassinet = true;
			}
			else if(e.EDIFACT_CODE == '8')
			{
				countEmpty++;
			}
		});

		if (hasLavatory)
		{
			seatDimensionKey = 'L';
		}
		else if (hasGalley)
		{
			seatDimensionKey = 'G';
		}
		else if (hasExitDoor)
		{
			seatDimensionKey = 'D';
		}
		else if(countEmpty >= totalSeatCol)
		{
			seatDimensionKey = '8';
		}
		else
		{
			if (seatclass != null && seatclass.trim() != '')
			{
				seatDimensionKey = '' + seatclass;
			}
			else
			{
				seatDimensionKey = '8';
			}
		}

		height = _seatDimensionOnly[seatDimensionKey].height + (2 * _seatDimensionOnly[seatDimensionKey].paddingTopBottom) + (2 * _seatDimensionOnly[seatDimensionKey].marginTopBottom);

		if (hasBassinet)
		{
			bassinetHeight = _seatDimensionOnly['B'].height + (2 * _seatDimensionOnly['B'].paddingTopBottom) + (2 * _seatDimensionOnly['B'].marginTopBottom);
			str += '\
							<tr>\
								<td style="padding:0px 15px; height: ' + bassinetHeight + 'px;" align="right" class="rowHeaderColumn">\
								</td>\
							</tr>\
			';
		}

		str += '<tr><td style="padding:0px 15px; height:' + height + 'px"><b>&nbsp;</b></td></tr>';
	}

	str += '\
					<!--<tr style="background-image: url(' + webPath + '/images/plane/tail_03.png); background-size: 100% 100%; background-position: 2px 0px">\
						<td height="366px;"></td>\
					</tr>-->\
				</table>\
			</center>\
		</div>\
	';

	$('#' + div).html(str);

	//Draw non seat which takes more than 1 column (needs to be merged) : lavatory, galley
	_drawNonSeatOnly(seatmap, webPath, div);
}

function _drawNonSeatOnly(seatmap, webPath, div)
{
	var nonSeats = [];
	var lastColnum = _getLastColnum(seatmap.seats);
	var currentRow = 0;
	var currentColStartMerge = 0;

	//Collect all non seats info (especially colspan info: where to start colspan & how many columns non-seat needs)
	$('#'+div+' .non-seat[data-details*="/LA/"], #'+div+' .non-seat[data-details*="/GN/"]').each(function(){
		var colnum = $(this).data('colnum');
		var rownum = $(this).data('rownum');
		var seatId = $(this).data('seatId');
		var details = $(this).data('details');

		var range = _getSeatGroupRangeOnly(rownum, colnum, seatmap.seats, div);

		colspanCount = (range.end - range.start + 1);

		if (rownum != currentRow || range.start != currentColStartMerge)
		{
			nonSeats.push({
				id 				: seatId,
				rownum			: rownum,
				colnumStart		: range.start,
				colspanCount	: colspanCount,
				details 		: details
			});
		}

		currentRow = rownum;
		currentColStartMerge = range.start; 
	});

	for (var i = 0 ; i < nonSeats.length ; i++)
	{
		selector = '#'+div+' [data-rownum="' + nonSeats[i].rownum +'"][data-colnum="' + nonSeats[i].colnumStart + '"]';
		details = nonSeats[i].details;

		//Lavatory
		if (details.indexOf('/LA/') != -1)
		{
			if(nonSeats[i].colspanCount == 1)
			{
				$(selector).html('<div class="lavatory"><i class="fa fa-male" aria-hidden="true"></i></div>');
			}
			else
			{
				$(selector).html('<div class="lavatory"><i class="fa fa-male" aria-hidden="true"></i> | <i class="fa fa-female" aria-hidden="true"></i></div>');
			}
		}
		//Galley
		else if (details.indexOf('/GN/') != -1)
		{
			$(selector).html('<div class="galley"><i class="fa fa-glass" aria-hidden="true"></i></div>');
		}

		//Add colspan, non-seat class, & details attribute
		$(selector).attr('colspan', nonSeats[i].colspanCount);
		$(selector).attr('class','non-seat');
		$(selector).attr('data-details', details);

		//Border
		if ($(selector).data('colnum') == 1)
		{
			$(selector).find('.lavatory, .galley').addClass('flat-left-border');
		}
		else if ($(selector).data('colnum') == (seatmap.header.length - nonSeats[i].colspanCount + 1))
		{
			$(selector).find('.lavatory, .galley').addClass('flat-right-border');
			$(selector).attr('style','padding-right: 30px!important');
		}

		//Remove seats in colspan other than the start of colspan
		elToRemove = $(selector).next();

		for (var j = 0 ; j < nonSeats[i].colspanCount - 1 ; j++)
		{
			elToRemoveNext = elToRemove.next();
			elToRemove.remove();
			elToRemove = elToRemoveNext;
		}
	}
}

function setPadding(seatrow)
{
	if(seatrow == null || seatrow == '')
		return 'padding:1px 15px;';
	else
		return 'padding:0px 15px;';
}

function _getLastColnum(seats)
{
	return parseInt(seats[seats.length - 1].COL_NUM);
}

function _getSeatGroupRangeOnly(rownum, colnum, seats, div)
{
	rownum = parseInt(rownum);
	colnum = parseInt(colnum);
	var lastColnum = _getLastColnum(seats);

	start = 1;
	end = 1;

	//Find aisle on the left
	for(var i = colnum - 1 ; i > 0 ; i--)
	{
		if(colnum == 1 || $('#'+div+' [data-rownum="' + rownum + '"][data-colnum="' + i + '"]').hasClass('aisle'))
		{
			start = i + 1;
			break;
		}
	}

	//Find aisle on the right
	for(var i = colnum; i <= lastColnum; i++)
	{
		if(i == lastColnum)
		{
			end = i;
		}
		else if($('#'+div+' [data-rownum="' + rownum + '"][data-colnum="' + i + '"]').hasClass('aisle'))
		{
			end = i - 1;
			break;
		}
	}

	return {
		start 	: start,
		end 	: end
	};
}

function _sortingZone( a, b ) {
  if ( parseInt(a.FIRST_ROW_NUM) < parseInt(b.FIRST_ROW_NUM) ){
    return -1;
  }
  if ( parseInt(a.FIRST_ROW_NUM) > parseInt(b.FIRST_ROW_NUM) ){
    return 1;
  }
  return 0;
}